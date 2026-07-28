import Anthropic from '@anthropic-ai/sdk'

/**
 * Single place where the model is configured.
 *
 * The model's job in this product is narrow on purpose: read messy listing text
 * and write explanations. Every dollar figure comes from the deterministic
 * models in lib/. See DESIGN.md for why.
 */
export const MODEL = 'claude-opus-5'

let cached: Anthropic | null = null

export function getClient(): Anthropic | null {
  if (!process.env.ANTHROPIC_API_KEY) return null
  if (!cached) cached = new Anthropic()
  return cached
}

export function hasModelAccess(): boolean {
  return Boolean(process.env.ANTHROPIC_API_KEY)
}

/** Pulls the first text block out of a response, tolerating thinking blocks. */
export function textOf(message: Anthropic.Message): string {
  return message.content
    .filter((b): b is Anthropic.TextBlock => b.type === 'text')
    .map((b) => b.text)
    .join('\n')
    .trim()
}
