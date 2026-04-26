import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Provider } from 'jotai'
import { ProductAssignmentDialog } from '@presentation/components/ProductAssignmentDialog/ProductAssignmentDialog'

// ── Hoist shared mock state so vi.mock factories can access it ─────────────────
const { mockBarcodeActions } = vi.hoisted(() => ({
  mockBarcodeActions: {
    detectBarcode: '',
    fallbackReason: 'permission_denied' as string,
  },
}))

// ── Other shared mock state ────────────────────────────────────────────────────
let mockIsMobile = true
let mockFindByBarcode: ReturnType<typeof vi.fn> = vi.fn().mockResolvedValue(null)

// ── Module mocks ──────────────────────────────────────────────────────────────

vi.mock('@presentation/utils/detectMobileDevice', () => ({
  detectMobileDevice: () => mockIsMobile,
}))

// Mock BarcodeScannerView with DOM trigger buttons so callbacks fire as React events
vi.mock('@presentation/components/BarcodeScannerView/BarcodeScannerView', () => ({
  BarcodeScannerView: (props: {
    onDetected: (barcode: string) => void
    onFallback: (reason: string) => void
  }) => (
    <div data-testid="barcode-scanner-view">
      Scanner Active
      <button
        data-testid="scanner-trigger-detect"
        onClick={() => props.onDetected(mockBarcodeActions.detectBarcode)}
      >
        Trigger Detect
      </button>
      <button
        data-testid="scanner-trigger-fallback"
        onClick={() => props.onFallback(mockBarcodeActions.fallbackReason)}
      >
        Trigger Fallback
      </button>
    </div>
  ),
}))

vi.mock('@di/container', () => ({
  groceryListRepository: {},
  categoryRepository: {},
  marketRepository: {},
  productRepository: {
    getAll: vi.fn().mockResolvedValue([]),
    getById: vi.fn(),
    findByBarcode: (...args: unknown[]) => mockFindByBarcode(...args),
    create: vi.fn(),
  },
  purchaseRepository: {},
  productPriceRecordRepository: {
    getLastPriceForProduct: vi.fn().mockResolvedValue(null),
    createBatch: vi.fn(),
  },
  barcodeDecoder: {},
}))

// ── Helpers ───────────────────────────────────────────────────────────────────

function renderDialog(props: Partial<Parameters<typeof ProductAssignmentDialog>[0]> = {}) {
  return render(
    <Provider>
      <ProductAssignmentDialog
        open={true}
        onClose={vi.fn()}
        onConfirm={vi.fn()}
        onCreateNew={vi.fn()}
        {...props}
      />
    </Provider>,
  )
}

// ── Setup ─────────────────────────────────────────────────────────────────────

beforeEach(() => {
  mockIsMobile = true
  mockFindByBarcode = vi.fn().mockResolvedValue(null)
  mockBarcodeActions.detectBarcode = ''
  mockBarcodeActions.fallbackReason = 'permission_denied'
})

afterEach(() => {
  vi.clearAllMocks()
})

// ── T012: US1 Scan on Mobile ──────────────────────────────────────────────────

describe('T012 – US1: Scan on Mobile', () => {
  it('Given mobile device, dialog opens with By Barcode tab active and camera embedded', async () => {
    renderDialog()

    await waitFor(() => {
      expect(screen.getByTestId('barcode-scanner-view')).toBeInTheDocument()
    })
    expect(screen.getByRole('button', { name: /by barcode/i })).toBeInTheDocument()
  })

  it('Given barcode detected and product found, product is pre-selected and camera is hidden', async () => {
    const mockProduct = {
      id: 'p-1',
      name: 'Whole Milk',
      barcode: '5901234123457',
      createdAt: '2026-01-01T00:00:00.000Z',
    }
    mockFindByBarcode = vi.fn().mockResolvedValue(mockProduct)
    mockBarcodeActions.detectBarcode = '5901234123457'

    renderDialog()

    await waitFor(() => screen.getByTestId('barcode-scanner-view'))

    await userEvent.click(screen.getByTestId('scanner-trigger-detect'))

    await waitFor(() => {
      expect(screen.getByText('Whole Milk')).toBeInTheDocument()
      expect(screen.queryByTestId('barcode-scanner-view')).not.toBeInTheDocument()
    })
  })

  it('Given barcode detected and no product found, barcode IS pre-filled and camera is hidden', async () => {
    mockFindByBarcode = vi.fn().mockResolvedValue(null)
    mockBarcodeActions.detectBarcode = '9999999999999'

    renderDialog()

    await waitFor(() => screen.getByTestId('barcode-scanner-view'))

    await userEvent.click(screen.getByTestId('scanner-trigger-detect'))

    await waitFor(() => {
      expect(screen.queryByTestId('barcode-scanner-view')).not.toBeInTheDocument()
      const searchInput = screen.getByLabelText(/search products/i)
      expect(searchInput).toHaveValue('9999999999999')
      expect(screen.getByText(/no products found/i)).toBeInTheDocument()
    })
  })

  it('Given mobile device, no Permissions API call is made upfront', async () => {
    const querySpy = vi.fn().mockResolvedValue({ state: 'granted' })
    Object.defineProperty(navigator, 'permissions', {
      value: { query: querySpy },
      writable: true,
      configurable: true,
    })

    renderDialog()

    await waitFor(() => {
      expect(screen.getByTestId('barcode-scanner-view')).toBeInTheDocument()
    })

    expect(querySpy).not.toHaveBeenCalled()
  })
})

// ── T015: US2 Camera Failure in By Barcode Tab ────────────────────────────────

describe('T015 – US2: Camera Failure in By Barcode Tab', () => {
  it('Given scanner emits permission_denied, hides camera and shows error banner with Try again', async () => {
    mockBarcodeActions.fallbackReason = 'permission_denied'
    renderDialog()

    await waitFor(() => screen.getByTestId('barcode-scanner-view'))
    await userEvent.click(screen.getByTestId('scanner-trigger-fallback'))

    await waitFor(() => {
      expect(screen.queryByTestId('barcode-scanner-view')).not.toBeInTheDocument()
      expect(screen.getByRole('alert')).toHaveTextContent(/camera access is unavailable/i)
      expect(screen.getByRole('button', { name: /try again/i })).toBeInTheDocument()
    })
  })

  it('Given scanner emits no_camera fallback, hides camera and shows unavailable message with Try again', async () => {
    mockBarcodeActions.fallbackReason = 'no_camera'
    renderDialog()

    await waitFor(() => screen.getByTestId('barcode-scanner-view'))
    await userEvent.click(screen.getByTestId('scanner-trigger-fallback'))

    await waitFor(() => {
      expect(screen.queryByTestId('barcode-scanner-view')).not.toBeInTheDocument()
      expect(screen.getByRole('alert')).toHaveTextContent(/camera could not be accessed/i)
      expect(screen.getByRole('button', { name: /try again/i })).toBeInTheDocument()
    })
  })

  it('Given scanner emits timeout fallback, hides camera and shows timeout message with Try again', async () => {
    mockBarcodeActions.fallbackReason = 'timeout'
    renderDialog()

    await waitFor(() => screen.getByTestId('barcode-scanner-view'))
    await userEvent.click(screen.getByTestId('scanner-trigger-fallback'))

    await waitFor(() => {
      expect(screen.queryByTestId('barcode-scanner-view')).not.toBeInTheDocument()
      expect(screen.getByRole('alert')).toHaveTextContent(/camera took too long/i)
      expect(screen.getByRole('button', { name: /try again/i })).toBeInTheDocument()
    })
  })

  it('Given scanner emits mid_session_error, shows interrupted banner with Try again button', async () => {
    mockBarcodeActions.fallbackReason = 'mid_session_error'
    renderDialog()

    await waitFor(() => screen.getByTestId('barcode-scanner-view'))
    await userEvent.click(screen.getByTestId('scanner-trigger-fallback'))

    await waitFor(() => {
      expect(screen.queryByTestId('barcode-scanner-view')).not.toBeInTheDocument()
      expect(screen.getByRole('alert')).toHaveTextContent(/camera was interrupted/i)
      expect(screen.getByRole('button', { name: /try again/i })).toBeInTheDocument()
    })
  })

  it('Given any error, clicking Try again restarts the camera scanner', async () => {
    mockBarcodeActions.fallbackReason = 'timeout'
    renderDialog()

    await waitFor(() => screen.getByTestId('barcode-scanner-view'))
    await userEvent.click(screen.getByTestId('scanner-trigger-fallback'))

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /try again/i })).toBeInTheDocument()
    })

    await userEvent.click(screen.getByRole('button', { name: /try again/i }))

    await waitFor(() => {
      expect(screen.getByTestId('barcode-scanner-view')).toBeInTheDocument()
      expect(screen.queryByRole('alert')).not.toBeInTheDocument()
    })
  })

  it('Given camera error, text input remains visible for manual barcode entry', async () => {
    mockBarcodeActions.fallbackReason = 'permission_denied'
    renderDialog()

    await waitFor(() => screen.getByTestId('barcode-scanner-view'))
    await userEvent.click(screen.getByTestId('scanner-trigger-fallback'))

    await waitFor(() => {
      expect(screen.getByLabelText(/search products/i)).toBeInTheDocument()
    })
  })
})

// ── T017: US3 Desktop Default ─────────────────────────────────────────────────

describe('T017 – US3: Desktop Default', () => {
  it('Given desktop (non-mobile), dialog opens with By Name tab active', async () => {
    mockIsMobile = false

    renderDialog()

    await waitFor(() => {
      expect(screen.queryByTestId('barcode-scanner-view')).not.toBeInTheDocument()
      expect(screen.getByLabelText(/search products/i)).toBeInTheDocument()
    })
  })

  it('Given desktop, navigator.permissions.query is never called', async () => {
    mockIsMobile = false
    const querySpy = vi.fn().mockResolvedValue({ state: 'granted' })
    Object.defineProperty(navigator, 'permissions', {
      value: { query: querySpy },
      writable: true,
      configurable: true,
    })

    renderDialog()

    await waitFor(() => {
      expect(screen.getByLabelText(/search products/i)).toBeInTheDocument()
    })

    expect(querySpy).not.toHaveBeenCalled()
  })

  it('Given desktop, no BarcodeScannerView is rendered', async () => {
    mockIsMobile = false

    renderDialog()

    await waitFor(() => {
      expect(screen.queryByTestId('barcode-scanner-view')).not.toBeInTheDocument()
    })
  })
})

// ── T018: US4 Barcode Carry-over to Product Creation ─────────────────────────

describe('T018 – US4: Barcode Carry-over to Product Creation', () => {
  it('Given By Barcode tab active with scanned barcode, Create New Product carries barcode', async () => {
    mockFindByBarcode = vi.fn().mockResolvedValue(null)
    mockBarcodeActions.detectBarcode = '1234567890128'

    renderDialog()

    await waitFor(() => screen.getByTestId('barcode-scanner-view'))
    await userEvent.click(screen.getByTestId('scanner-trigger-detect'))

    await waitFor(() => {
      const searchInput = screen.getByLabelText(/search products/i)
      expect(searchInput).toHaveValue('1234567890128')
    })

    await userEvent.click(screen.getByRole('button', { name: /create new product/i }))

    await waitFor(() => {
      const barcodeInput = screen.getByLabelText(/barcode/i)
      expect(barcodeInput).toHaveValue('1234567890128')
    })
  })

  it('Given By Name tab active, Create New Product does NOT carry barcode', async () => {
    mockIsMobile = false

    renderDialog()

    await waitFor(() => {
      expect(screen.getByLabelText(/search products/i)).toBeInTheDocument()
    })

    await userEvent.click(screen.getByRole('button', { name: /create new product/i }))

    await waitFor(() => {
      const barcodeInput = screen.getByLabelText(/barcode/i)
      expect(barcodeInput).toHaveValue('')
    })
  })

  it('Given By Barcode tab active, switching to By Name tab releases camera', async () => {
    renderDialog()

    await waitFor(() => {
      expect(screen.getByTestId('barcode-scanner-view')).toBeInTheDocument()
    })

    await userEvent.click(screen.getByRole('button', { name: /by name/i }))

    await waitFor(() => {
      expect(screen.queryByTestId('barcode-scanner-view')).not.toBeInTheDocument()
    })
  })

  it('Given By Barcode tab after switching back from By Name, camera restarts', async () => {
    renderDialog()

    await waitFor(() => expect(screen.getByTestId('barcode-scanner-view')).toBeInTheDocument())

    await userEvent.click(screen.getByRole('button', { name: /by name/i }))
    await waitFor(() => expect(screen.queryByTestId('barcode-scanner-view')).not.toBeInTheDocument())

    await userEvent.click(screen.getByRole('button', { name: /by barcode/i }))

    await waitFor(() => {
      expect(screen.getByTestId('barcode-scanner-view')).toBeInTheDocument()
    })
  })
})
