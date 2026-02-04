/**
 * Validation utilities for API inputs
 */

export const validators = {
  email: (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  },

  year: (year: string): boolean => {
    const yearNum = parseInt(year)
    return yearNum >= 2020 && yearNum <= 2030
  },

  branch: (branch: string): boolean => {
    const validBranches = ['AIML']
    return validBranches.includes(branch)
  },

  studentYear: (year: string): boolean => {
    const validYears = ['2nd Year', '3rd Year', '4th Year']
    return validYears.includes(year)
  },

  category: (category: string): boolean => {
    const validCategories = ['event', 'contribution', 'leadership', 'excellence']
    return validCategories.includes(category)
  },

  objectId: (id: string): boolean => {
    return /^[a-f\d]{24}$/i.test(id)
  },

  sanitizeString: (input: string, maxLength: number = 500): string => {
    return input
      .trim()
      .substring(0, maxLength)
      .replace(/[<>]/g, '') // Remove potential XSS characters
  }
}

export function validateMemberInput(data: any): { valid: boolean; errors: string[] } {
  const errors: string[] = []

  if (!data.name || data.name.trim().length < 2) {
    errors.push('Name must be at least 2 characters')
  }

  if (!validators.email(data.email)) {
    errors.push('Invalid email format')
  }

  if (!validators.branch(data.branch)) {
    errors.push('Invalid branch')
  }

  if (!validators.studentYear(data.year)) {
    errors.push('Invalid year')
  }

  return {
    valid: errors.length === 0,
    errors
  }
}

export function validateAchievementInput(data: any): { valid: boolean; errors: string[] } {
  const errors: string[] = []

  if (!data.title || data.title.trim().length < 3) {
    errors.push('Title must be at least 3 characters')
  }

  if (!data.description || data.description.trim().length < 10) {
    errors.push('Description must be at least 10 characters')
  }

  if (!validators.category(data.category)) {
    errors.push('Invalid category')
  }

  if (!data.date || isNaN(Date.parse(data.date))) {
    errors.push('Invalid date')
  }

  return {
    valid: errors.length === 0,
    errors
  }
}
