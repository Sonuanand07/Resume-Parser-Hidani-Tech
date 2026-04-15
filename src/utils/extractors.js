/**
 * Utility functions for extracting various information from text
 */

/**
 * Extract salary from text
 * Supports formats: "12 LPA", "12,00,000", "$100,000", "₹10,00,000"
 * @param {string} text - Text to extract salary from
 * @returns {string|null} - Extracted salary or null
 */
function extractSalary(text) {
  if (!text) return null;

  // Pattern 1: Range like "10 - 15 LPA" - CHECK FIRST
  const rangeMatch = text.match(/(\d+(?:,\d+)?(?:\.\d+)?)\s*-\s*(\d+(?:,\d+)?(?:\.\d+)?)\s*(?:LPA|lakhs?)/i);
  if (rangeMatch) {
    return `${rangeMatch[1]} - ${rangeMatch[2]} LPA`;
  }

  // Pattern 2: X LPA or "X Lakhs Per Annum"
  const lpaMatch = text.match(/(\d+(?:,\d+)?(?:\.\d+)?)\s*(?:LPA|lakhs?\s+per\s+annum|lakh\s+per\s+annum)/i);
  if (lpaMatch) {
    return `${lpaMatch[1]} LPA`;
  }

  // Pattern 3: ₹X,XX,XXX or INR X,XX,XXX
  const inrMatch = text.match(/(?:₹|INR|Rupees?)\s*(\d+(?:,\d+)*(?:\.\d+)?)/i);
  if (inrMatch) {
    return `₹${inrMatch[1]} per annum`;
  }

  // Pattern 4: $X,XXX or USD X,XXX
  const usdMatch = text.match(/(?:\$|USD)\s*(\d+(?:,\d+)*(?:\.\d+)?)/i);
  if (usdMatch) {
    return `$${usdMatch[1]}`;
  }

  // Pattern 5: "CTC: X" or "Salary: X"
  const ctcMatch = text.match(/(?:CTC|Salary|Compensation):\s*(?:₹|₹\s*)?(\d+(?:,\d+)*(?:\.\d+)?)/i);
  if (ctcMatch) {
    return `₹${ctcMatch[1]}`;
  }

  return null;
}

/**
 * Extract years of experience from text
 * @param {string} text - Text to extract experience from
 * @returns {number|string|null} - Years of experience or "Fresher"/"Entry-Level" or null
 */
function extractYearsOfExperience(text) {
  if (!text) return null;

  // Check for fresher/entry-level keywords
  if (/\b(?:fresher|entry-?level|graduate|recent|no experience required)\b/i.test(text)) {
    return 0;
  }

  // Pattern 1: "X years of experience"
  const yearsMatch = text.match(/(\d+(?:\.\d+)?)\s*(?:\+)?\s*years?\s+of\s+(?:professional\s+)?experience/i);
  if (yearsMatch) {
    return parseFloat(yearsMatch[1]);
  }

  // Pattern 2: "X-Y years"
  const rangeMatch = text.match(/(\d+(?:\.\d+)?)\s*-\s*(\d+(?:\.\d+)?)\s*years?\s+(?:of\s+)?experience/i);
  if (rangeMatch) {
    const min = parseFloat(rangeMatch[1]);
    const max = parseFloat(rangeMatch[2]);
    return (min + max) / 2; // Return average
  }

  // Pattern 3: Just "X years" without "of experience"
  const simpleMatch = text.match(/(\d+(?:\.\d+)?)\+?\s*(?:years?|yrs?)\b/i);
  if (simpleMatch) {
    return parseFloat(simpleMatch[1]);
  }

  // Pattern 4: Calculate from date ranges like "2015 - 2023"
  const dateRangeMatch = text.match(/(\d{4})\s*-\s*(?:present|today|current|now|2024|2025)/i);
  if (dateRangeMatch) {
    const startYear = parseInt(dateRangeMatch[1]);
    const endYear = new Date().getFullYear();
    return endYear - startYear;
  }

  return null;
}

/**
 * Extract phone number from text
 * @param {string} text - Text to extract phone from
 * @returns {string|null} - Phone number or null
 */
function extractPhoneNumber(text) {
  if (!text) return null;

  // Indian phone number pattern: 10 digits, with optional +91 or 0
  const phoneMatch = text.match(/(?:\+91[-.\s]?)?(?:[0][-.\s]?)?[6789]\d{9}/);
  if (phoneMatch) {
    return phoneMatch[0];
  }

  // International phone pattern
  const internationalMatch = text.match(/\+\d{1,3}\s?\d{1,14}/);
  if (internationalMatch) {
    return internationalMatch[0];
  }

  return null;
}

/**
 * Extract email from text
 * @param {string} text - Text to extract email from
 * @returns {string|null} - Email or null
 */
function extractEmail(text) {
  if (!text) return null;

  const emailMatch = text.match(/[\w.-]+@[\w.-]+\.\w+/);
  return emailMatch ? emailMatch[0] : null;
}

/**
 * Extract name from text (usually first line or from "Name:" label)
 * @param {string} text - Text to extract name from
 * @returns {string|null} - Name or null
 */
function extractName(text) {
  if (!text) return null;

  // Pattern 1: "Name: John Doe"
  const labeledMatch = text.match(/(?:Name|Full\s+Name|Candidate\s+Name):\s*([A-Z][a-zA-Z\s]+)/i);
  if (labeledMatch) {
    return labeledMatch[1].trim();
  }

  // Pattern 2: First non-empty line (often contains name in resume)
  const lines = text.split('\n');
  for (let line of lines) {
    line = line.trim();
    
    // Skip common resume headers
    if (line && !/^(RESUME|CURRICULUM VITAE|CV|PROFILE|SUMMARY|OBJECTIVE)/i.test(line) && line.length > 0 && line.length < 100) {
      // Check if it looks like a name (contains letters, not too many numbers)
      if (/[A-Z][a-zA-Z\s]{2,}/.test(line) && !/^\d/.test(line)) {
        // Remove extra whitespace and return
        const name = line.replace(/\s+/g, ' ').trim();
        if (!/[^\w\s\-']/.test(name) || name.match(/^[A-Za-z\s\-']+$/)) {
          return name;
        }
      }
    }
  }

  return null;
}

/**
 * Extract education qualification from text
 * @param {string} text - Text to extract education from
 * @returns {string[]} - Array of qualifications
 */
function extractEducation(text) {
  if (!text) return [];

  const qualifications = [];
  
  // Common degree patterns
  const degreePatterns = [
    /B\.?A\.?|Bachelor\s+of\s+Arts/i,
    /B\.?S\.?|B\.?Tech\.?|Bachelor\s+of\s+Technology/i,
    /B\.?C\.?A\.?|Bachelor\s+of\s+Computer\s+Applications/i,
    /M\.?A\.?|Master\s+of\s+Arts/i,
    /M\.?S\.?|M\.?Tech\.?|Master\s+of\s+Technology/i,
    /M\.?C\.?A\.?|Master\s+of\s+Computer\s+Applications/i,
    /MBA|Master\s+of\s+Business\s+Administration/i,
    /Ph\.?D\.|Doctor\s+of\s+Philosophy/i,
    /Diploma/i,
    /High\s+School|12th|XII/i,
  ];

  for (let pattern of degreePatterns) {
    if (pattern.test(text)) {
      const match = text.match(pattern);
      if (match && !qualifications.includes(match[0])) {
        qualifications.push(match[0]);
      }
    }
  }

  return qualifications;
}

module.exports = {
  extractSalary,
  extractYearsOfExperience,
  extractPhoneNumber,
  extractEmail,
  extractName,
  extractEducation,
};
