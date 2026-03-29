import styled from 'styled-components'

export const ModalContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 8px 0;
`

export const ItemsSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`

export const CategoryGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
`

export const CategoryHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 4px;
  cursor: pointer;
  user-select: none;
`

export const ItemRow = styled.div<{ $accentColor: string }>`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 12px;
  border-radius: 6px;
  border-left: 4px solid ${({ $accentColor }) => $accentColor};
  background-color: ${({ $accentColor }) => $accentColor}12;
  transition: background-color 0.15s;

  &:hover {
    background-color: ${({ $accentColor }) => $accentColor}22;
  }
`

export const ItemActions = styled.div`
  display: flex;
  gap: 2px;
  flex-shrink: 0;
`
