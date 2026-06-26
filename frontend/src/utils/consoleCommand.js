// Parser for the command console.
//
// Translates odrivetool-style input lines into thin-backend operations:
//   "vbus_voltage"                 -> { type: 'read',    path }
//   "axis0.requested_state = 8"    -> { type: 'write',   path, value }
//   "save_configuration()"         -> { type: 'command', path, args: [] }
//   "axis0.controller.move_incremental(1.0, true)" -> command with args
//
// The leading "odrv0." (or "odrvN.") prefix is optional and stripped.

const PREFIX_RE = /^odrv\d*\./

function stripPrefix(path) {
  return path.replace(PREFIX_RE, '')
}

function parseLiteral(token) {
  const t = token.trim()
  if (t === 'true' || t === 'True') return true
  if (t === 'false' || t === 'False') return false
  if (/^-?\d+$/.test(t)) return parseInt(t, 10)
  if (/^-?\d*\.\d+(e-?\d+)?$/i.test(t) || /^-?\d+e-?\d+$/i.test(t)) return parseFloat(t)
  // Quoted string
  const q = /^["'](.*)["']$/.exec(t)
  if (q) return q[1]
  return t // bare identifier/enum name; left as a string
}

/**
 * Parse a single console line.
 * @returns {{type:'read'|'write'|'command', path:string, value?:*, args?:any[]} | {error:string}}
 */
export function parseConsoleCommand(line) {
  const trimmed = (line || '').trim()
  if (!trimmed) return { error: 'empty command' }

  // Assignment -> write
  const eq = trimmed.indexOf('=')
  // Guard against "==" or function calls containing '='
  if (eq > 0 && trimmed[eq + 1] !== '=' && !/\(.*=.*\)/.test(trimmed)) {
    const path = stripPrefix(trimmed.slice(0, eq).trim())
    const value = parseLiteral(trimmed.slice(eq + 1))
    if (!path) return { error: 'missing path before =' }
    return { type: 'write', path, value }
  }

  // Function call -> command
  const call = /^(.+?)\((.*)\)\s*$/.exec(trimmed)
  if (call) {
    const path = stripPrefix(call[1].trim())
    const argStr = call[2].trim()
    const args = argStr === '' ? [] : splitArgs(argStr).map(parseLiteral)
    return { type: 'command', path, args }
  }

  // Otherwise -> read
  return { type: 'read', path: stripPrefix(trimmed) }
}

// Split on top-level commas (no nested parens/quotes expected for ODrive calls).
function splitArgs(s) {
  return s.split(',').map((x) => x.trim()).filter((x) => x.length > 0)
}
