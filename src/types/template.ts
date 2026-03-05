export interface TemplateSubsection {
  id: string
  title: string
  defaultText: string
  normalText?: string
  placeholder?: string
}

export interface TemplateSection {
  id: string
  title: string
  type: 'free_text' | 'group'
  defaultText?: string
  normalText?: string
  placeholder?: string
  subsections?: TemplateSubsection[]
}

export interface ChecklistItem {
  id: string
  category: string
  item: string
  keywords: string[]
}

export interface Template {
  id: string
  name: string
  modality: string
  bodyPart: string
  language: string
  version: string
  sections: TemplateSection[]
  checklist?: ChecklistItem[]
}

export interface TemplateListItem {
  id: string
  name: string
  modality: string
  file: string
}
