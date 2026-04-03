export interface MarketAddress {
  street: string
  city: string
  state: string
  zip: string
}

export interface Market {
  id: string
  name: string
  address: MarketAddress
  createdAt: string
}
