export interface ParsedDeclaration {
  field:
    | 'netQuantity'
    | 'mrp'
    | 'manufacturingDate'
    | 'expiryDate'
    | 'batchNumber'
    | 'consumerCare'
    | 'manufacturer'

  value: string
  confidence: number
  sourceText: string
}

/**
 * Basic OCR cleanup.
 *
 * We deliberately keep line breaks because package declarations
 * are often separated by lines such as:
 *
 * NET CONTENT: 236 ml
 * MFG. DATE: 10/2025
 * BATCH NO: ABC123
 */
function cleanText(text: string): string {
  return text
    .replace(/\r/g, '')
    .replace(/[ \t]+/g, ' ')
    .replace(/[ ]+\n/g, '\n')
    .replace(/\n[ ]+/g, '\n')
    .trim()
}

/**
 * Normalize common OCR formatting without destroying
 * the original text structure.
 */
function normalizeOcrText(text: string): string {
  return text
    .replace(/[|]/g, ' ')
    .replace(/[{}[\]\\]/g, ' ')
    .replace(/[ \t]+/g, ' ')
    .trim()
}

/**
 * Add a declaration only if:
 * - a real value exists
 * - the same field has not already been detected
 */
function addDeclaration(
  declarations: ParsedDeclaration[],
  field: ParsedDeclaration['field'],
  value: string,
  sourceText: string,
  confidence: number,
) {
  const cleanedValue = value
    .replace(/\s+/g, ' ')
    .trim()

  if (!cleanedValue) return

  if (
    declarations.some(
      (item) => item.field === field,
    )
  ) {
    return
  }

  declarations.push({
    field,
    value: cleanedValue,
    confidence,
    sourceText: sourceText
      .replace(/\s+/g, ' ')
      .trim(),
  })
}

/**
 * Return the first useful match from a list of patterns.
 */
function findFirstMatch(
  text: string,
  patterns: RegExp[],
): RegExpMatchArray | null {
  for (const pattern of patterns) {
    const match = text.match(pattern)

    if (match) {
      return match
    }
  }

  return null
}

/**
 * Extract structured declarations from OCR text.
 *
 * Important architecture:
 *
 * OCR/Tesseract answers:
 * "What text is present on the package?"
 *
 * The compliance engine will later answer:
 * "Does that declaration comply with the applicable rule?"
 */
export function parseDeclarations(
  ocrText: string,
  ocrConfidence: number,
): ParsedDeclaration[] {
  const declarations: ParsedDeclaration[] = []

  if (!ocrText || !ocrText.trim()) {
    return declarations
  }

  const text = cleanText(ocrText)
  const normalized = normalizeOcrText(text)

  // =========================================================
  // 1. NET QUANTITY / NET CONTENT
  // =========================================================

  const quantityMatch = findFirstMatch(
    normalized,
    [
      /\bnet\s+(?:content|contents|quantity|qty|wt|weight)\.?\s*[:.\-]?\s*(\d+(?:\.\d+)?)\s*(kg|g|mg|ml|l|litre|liter)\b/i,

      /\bnet\s+contents?\s*[:.\-]?\s*(\d+(?:\.\d+)?)\s*(kg|g|mg|ml|l)\b/i,

      /\bnet\s*content\s*[:.\-]?\s*(\d+(?:\.\d+)?)\s*(kg|g|mg|ml|l)\b/i,
    ],
  )

  if (quantityMatch) {
    addDeclaration(
      declarations,
      'netQuantity',
      `${quantityMatch[1]} ${quantityMatch[2]}`,
      quantityMatch[0],
      ocrConfidence,
    )
  }

  // =========================================================
  // 2. MRP
  // =========================================================

  /**
   * We intentionally allow the currency symbol to be absent.
   *
   * Reason:
   * OCR may read:
   *
   * MRP ₹199
   *
   * as:
   *
   * MRP 199
   *
   * The compliance engine will later determine whether
   * the currency declaration itself is compliant.
   */

  const mrpMatch = findFirstMatch(
    normalized,
    [
      /\bM\.?\s*R\.?\s*P\.?\s*[:.\-]?\s*(₹|Rs\.?|INR)?\s*(\d+(?:\.\d{1,2})?)\b/i,

      /\bmaximum\s+retail\s+price\s*[:.\-]?\s*(₹|Rs\.?|INR)?\s*(\d+(?:\.\d{1,2})?)\b/i,
    ],
  )

  if (mrpMatch) {
    // Pattern has currency in group 1 and amount in group 2.
    const amount = mrpMatch[2]

    addDeclaration(
      declarations,
      'mrp',
      amount,
      mrpMatch[0],
      ocrConfidence,
    )
  }

  // =========================================================
  // 3. MANUFACTURING / PACKING DATE
  // =========================================================

  const manufacturingMatch =
    findFirstMatch(normalized, [
      /\b(?:mfg|mfd|manufactured|manufacturing|pkd|packed|packing)\.?\s*(?:date)?\s*[:.\-]?\s*(\d{1,2}[\/.\-]\d{1,2}[\/.\-]\d{2,4})\b/i,

      /\b(?:mfg|mfd|manufactured|manufacturing|pkd|packed|packing)\.?\s*(?:date)?\s*[:.\-]?\s*(\d{1,2}[\/.\-]\d{4})\b/i,

      /\b(?:mfg|mfd|manufactured|manufacturing|pkd|packed|packing)\.?\s*(?:date)?\s*[:.\-]?\s*(\d{2}[\/.\-]\d{2,4})\b/i,
    ])

  if (manufacturingMatch) {
    addDeclaration(
      declarations,
      'manufacturingDate',
      manufacturingMatch[1],
      manufacturingMatch[0],
      ocrConfidence,
    )
  }

  // =========================================================
  // 4. EXPIRY / BEST BEFORE
  // =========================================================

  const expiryDateMatch =
    findFirstMatch(normalized, [
      /\b(?:expiry|exp|use\s+before|best\s+before)\s*[:.\-]?\s*(\d{1,2}[\/.\-]\d{1,2}[\/.\-]\d{2,4})\b/i,

      /\b(?:expiry|exp|use\s+before|best\s+before)\s*[:.\-]?\s*(\d{1,2}[\/.\-]\d{4})\b/i,
    ])

  if (expiryDateMatch) {
    addDeclaration(
      declarations,
      'expiryDate',
      expiryDateMatch[1],
      expiryDateMatch[0],
      ocrConfidence,
    )
  } else {
    /**
     * Some packages declare:
     *
     * BEST BEFORE 36 MONTHS
     *
     * This is not literally an expiry date, but it is still
     * important package information and can be evaluated later
     * by the compliance engine.
     */
    const bestBeforeDuration =
      normalized.match(
        /\bbest\s+before\s*[:.\-]?\s*(\d+\s*(?:months?|years?))\b/i,
      )

    if (bestBeforeDuration) {
      addDeclaration(
        declarations,
        'expiryDate',
        bestBeforeDuration[1],
        bestBeforeDuration[0],
        ocrConfidence,
      )
    }
  }

  // =========================================================
  // 5. BATCH / LOT NUMBER
  // =========================================================

  const batchMatch = findFirstMatch(
    normalized,
    [
      /\b(?:batch|lot)\s*(?:no\.?|number|num)?\s*[:.\-]?\s*([A-Z0-9][A-Z0-9\/.\-]{2,})\b/i,

      /\b(?:batch\s+no|lot\s+no)\s*[:.\-]?\s*([A-Z0-9][A-Z0-9\/.\-]{2,})\b/i,
    ],
  )

  if (batchMatch) {
    const candidate = batchMatch[1].trim()

    const invalidBatchValues = new Set([
      'NO',
      'NUMBER',
      'NUM',
      'NONE',
      'NIL',
    ])

    if (
      candidate.length >= 3 &&
      !invalidBatchValues.has(
        candidate.toUpperCase(),
      )
    ) {
      addDeclaration(
        declarations,
        'batchNumber',
        candidate,
        batchMatch[0],
        ocrConfidence,
      )
    }
  }

  // =========================================================
  // 6. CONSUMER CARE
  // =========================================================

  /**
   * We first look for an actual phone number/email.
   *
   * This prevents:
   *
   * "CUSTOMER CARE"
   *
   * from becoming a declaration by itself.
   */

  const phoneMatches = normalized.match(
    /(?:\+91[\s-]?)?[6-9]\d{9}\b/g,
  )

  const emailMatches = normalized.match(
    /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi,
  )

  const consumerCareLabel =
    normalized.match(
      /\b(?:customer\s+care|consumer\s+care|consumer\s+complaints?|customer\s+support)\b/i,
    )

  const values: string[] = []

  if (phoneMatches) {
    for (const phone of phoneMatches) {
      if (!values.includes(phone)) {
        values.push(phone)
      }

      // Usually one consumer-care number is enough.
      if (values.length >= 2) break
    }
  }

  if (emailMatches) {
    for (const email of emailMatches) {
      if (!values.includes(email)) {
        values.push(email)
      }
    }
  }

  if (values.length > 0) {
    const sourceText = consumerCareLabel
      ? `${consumerCareLabel[0]}: ${values.join(' | ')}`
      : values.join(' | ')

    addDeclaration(
      declarations,
      'consumerCare',
      values.join(' | '),
      sourceText,
      ocrConfidence,
    )
  }

  // =========================================================
  // 7. MANUFACTURER
  // =========================================================

  /**
   * Manufacturer extraction is intentionally conservative.
   *
   * We do NOT want:
   *
   * "MARKETED BY"
   *
   * or:
   *
   * "MANUFACTURED BY"
   *
   * to become the manufacturer.
   */

  const manufacturerPatterns = [
    /\bmanufactured\s+by\s*[:.\-]?\s*([A-Za-z][A-Za-z0-9&.,'()\- ]{2,100}?)(?=\s+(?:plot|address|mfg|mfd|batch|lot|mrp|customer|consumer|ingredients|net\s+content|net\s+quantity|customer\s+care)\b|$)/i,

    /\bmanufactured\s*&\s*marketed\s+by\s*[:.\-]?\s*([A-Za-z][A-Za-z0-9&.,'()\- ]{2,100}?)(?=\s+(?:plot|address|mfg|mfd|batch|lot|mrp|customer|consumer|ingredients|net\s+content|net\s+quantity|customer\s+care)\b|$)/i,

    /\bmanufactured\s+and\s+marketed\s+by\s*[:.\-]?\s*([A-Za-z][A-Za-z0-9&.,'()\- ]{2,100}?)(?=\s+(?:plot|address|mfg|mfd|batch|lot|mrp|customer|consumer|ingredients|net\s+content|net\s+quantity|customer\s+care)\b|$)/i,

    /\bmarketed\s+by\s*[:.\-]?\s*([A-Za-z][A-Za-z0-9&.,'()\- ]{2,100}?)(?=\s+(?:plot|address|mfg|mfd|batch|lot|mrp|customer|consumer|ingredients|net\s+content|net\s+quantity|customer\s+care)\b|$)/i,
  ]

  for (const pattern of manufacturerPatterns) {
    const manufacturerMatch =
      normalized.match(pattern)

    if (!manufacturerMatch) continue

    const candidate =
      manufacturerMatch[1]
        .replace(/\s+/g, ' ')
        .trim()

    if (
      candidate.length >= 3 &&
      !/^(?:BY|NO|NUMBER|MARKETED|MANUFACTURED)$/i.test(
        candidate,
      )
    ) {
      addDeclaration(
        declarations,
        'manufacturer',
        candidate,
        manufacturerMatch[0],
        ocrConfidence,
      )

      break
    }
  }

  return declarations
}