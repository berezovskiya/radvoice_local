import type { MappingResult } from '../types/mapping'
import type { Template } from '../types/template'
import { buildMappingPrompt } from '../prompts/mappingPrompt'
import { buildImpressionPrompt } from '../prompts/impressionPrompt'

const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions'
const MODEL = 'google/gemini-2.0-flash-001'

export async function mapTranscriptToTemplate(
  template: Template,
  transcript: string,
): Promise<MappingResult> {
  const apiKey = await window.electronAPI.getApiKey()
  if (!apiKey) {
    throw new Error('OpenRouter API key не налаштований. Відкрийте Налаштування.')
  }

  const prompt = buildMappingPrompt(template, transcript)

  const response = await fetch(OPENROUTER_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
      'X-Title': 'RadVoice',
    },
    body: JSON.stringify({
      model: MODEL,
      messages: [
        { role: 'user', content: prompt },
      ],
      temperature: 0.1,
      max_tokens: 4096,
    }),
  })

  if (!response.ok) {
    const errorBody = await response.text()
    throw new Error(`OpenRouter API error (${response.status}): ${errorBody}`)
  }

  const data = await response.json()
  const content = data.choices?.[0]?.message?.content

  if (!content) {
    throw new Error('Порожня відповідь від LLM')
  }

  // Strip possible markdown code fences
  const jsonStr = content
    .replace(/^```json?\s*/i, '')
    .replace(/```\s*$/, '')
    .trim()

  try {
    const result: MappingResult = JSON.parse(jsonStr)
    if (!result.sectionUpdates || !Array.isArray(result.sectionUpdates)) {
      throw new Error('Invalid mapping result: missing sectionUpdates')
    }
    if (!result.unmappedFragments) {
      result.unmappedFragments = []
    }
    return fixFragmentPositions(result, transcript)
  } catch (parseErr) {
    throw new Error(
      `Не вдалося розпарсити відповідь LLM: ${parseErr instanceof Error ? parseErr.message : String(parseErr)}`,
    )
  }
}

export async function generateImpression(
  template: Template,
  mappingResult: MappingResult,
): Promise<string> {
  const apiKey = await window.electronAPI.getApiKey()
  if (!apiKey) {
    throw new Error('OpenRouter API key не налаштований. Відкрийте Налаштування.')
  }

  const prompt = buildImpressionPrompt(template, mappingResult)

  const response = await fetch(OPENROUTER_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
      'X-Title': 'RadVoice',
    },
    body: JSON.stringify({
      model: MODEL,
      messages: [
        { role: 'user', content: prompt },
      ],
      temperature: 0.2,
      max_tokens: 1024,
    }),
  })

  if (!response.ok) {
    const errorBody = await response.text()
    throw new Error(`OpenRouter API error (${response.status}): ${errorBody}`)
  }

  const data = await response.json()
  const content = data.choices?.[0]?.message?.content

  if (!content) {
    throw new Error('Порожня відповідь від LLM')
  }

  return content.trim()
}

/**
 * LLMs are unreliable at counting character positions.
 * Re-derive startChar/endChar by searching for the fragment text in the transcript.
 */
function fixFragmentPositions(result: MappingResult, transcript: string): MappingResult {
  const lowerTranscript = transcript.toLowerCase()
  const claimed: { start: number; end: number }[] = []

  function findPosition(text: string): { start: number; end: number } | null {
    if (!text || text.trim().length === 0) return null

    const candidates = [
      text,
      text.trim(),
      text.trim().replace(/\s+/g, ' '),
    ]

    for (const candidate of candidates) {
      const needle = candidate.toLowerCase()
      let searchFrom = 0
      while (searchFrom < lowerTranscript.length) {
        const idx = lowerTranscript.indexOf(needle, searchFrom)
        if (idx === -1) break
        const end = idx + candidate.length
        const overlaps = claimed.some((c) => idx < c.end && end > c.start)
        if (!overlaps) {
          claimed.push({ start: idx, end })
          return { start: idx, end }
        }
        searchFrom = idx + 1
      }
    }
    return null
  }

  const fixedUpdates = result.sectionUpdates.map((update) => ({
    ...update,
    sourceFragments: (update.sourceFragments ?? []).map((frag) => {
      const pos = findPosition(frag.text)
      if (pos) return { ...frag, startChar: pos.start, endChar: pos.end }
      return frag
    }),
  }))

  const fixedUnmapped = (result.unmappedFragments ?? []).map((frag) => {
    const pos = findPosition(frag.text)
    if (pos) return { ...frag, startChar: pos.start, endChar: pos.end }
    return frag
  })

  return { sectionUpdates: fixedUpdates, unmappedFragments: fixedUnmapped }
}
