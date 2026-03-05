export interface SourceFragment {
  text: string
  startChar: number
  endChar: number
}

export interface SectionUpdate {
  sectionId: string
  action: 'replaced' | 'confirmed_normal' | 'not_mentioned' | 'auto_normal'
  newText: string
  sourceFragments: SourceFragment[]
}

export interface UnmappedFragment {
  text: string
  startChar: number
  endChar: number
  reason: string
}

export interface MappingResult {
  sectionUpdates: SectionUpdate[]
  unmappedFragments: UnmappedFragment[]
}
