export interface _Resource {
  id: string | number,
  title: string,
  description: string,
  isVisible: boolean
}

export interface _Resources {
  [id: string | number]: _Resource
}