export interface Embedding {
  object: string
  data: Daum[]
  model: string
  usage: Usage
}

export interface Daum {
  object: string
  index: number
  embedding: number[]
}

export interface Usage {
  prompt_tokens: number
  total_tokens: number
}
