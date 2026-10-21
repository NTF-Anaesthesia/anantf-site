// One marking: Claude reads the rubric and the question's key (the system prompt, cached) and the candidate's answer.
import Anthropic from '@anthropic-ai/sdk';
import { betaJSONSchemaOutputFormat } from '@anthropic-ai/sdk/helpers/beta/json-schema';
import { SCHEMA, systemFor, userText } from './prompt.js';

const MODEL = 'claude-opus-5-5';

// -> { ok: true, model, marking, usage } or { ok: false, status, error }
export async function markWithClaude(env, q, answer) {
  const client = new Anthropic({ apiKey: env.ANTHROPIC_API_KEY });
  try {
    const response = await client.beta.messages.parse({
      model: env.MODEL || MODEL,
      max_tokens: 16000,
      betas: ['server-side-fallback-2026-07-01'],
      fallbacks: 'default',
      output_config: { effort: env.EFFORT || 'medium', format: betaJSONSchemaOutputFormat(SCHEMA) },
      system: [{ type: 'text', text: systemFor(q), cache_control: { type: 'ephemeral' } }],
      messages: [{ role: 'user', content: userText(answer) }],
    });
    if (response.stop_reason === 'refusal') return { ok: false, status: 422, error: 'This answer could not be marked. Try rewording it and mark it again.' };
    if (response.stop_reason === 'max_tokens' || !response.parsed_output) return { ok: false, status: 502, error: 'The marking was cut short. Mark it again.' };
    return { ok: true, model: response.model, marking: response.parsed_output, usage: response.usage };
  } catch (err) {
    if (err instanceof Anthropic.RateLimitError) return { ok: false, status: 429, error: 'The marker is busy. Your answer is saved: mark it again in a minute.' };
    if (err instanceof Anthropic.APIError) { console.error(err.status, err.message); return { ok: false, status: 502, error: 'The marker is unavailable right now. Your answer is saved: mark it again shortly.' }; }
    throw err;
  }
}
