export type Severity = 'Critical' | 'High' | 'Medium'

export interface PendingReview {
  id: string
  product: string
  manufacturer: string
  detectionDate: string
  severity: Severity
}

export interface HighPriorityAction {
  id: string
  title: string
  description: string
  time: string
  severity: 'critical' | 'high'
}

export const dashboardStats = {
  totalInspections: 1492,
  totalInspectionsChange: 12,
  compliant: 1105,
  complianceRate: 74,
  nonCompliant: 284,
  nonCompliantChange: 3,
  underReview: 103,
}

export const pendingReviews: PendingReview[] = [
  {
    id: 'INSP-2938',
    product: 'Premium Basmati Rice 5kg',
    manufacturer: 'AgriFoods India Ltd.',
    detectionDate: '2023-10-24',
    severity: 'Critical',
  },
  {
    id: 'INSP-2937',
    product: 'Refined Sunflower Oil 1L',
    manufacturer: 'SunPure Mills',
    detectionDate: '2023-10-23',
    severity: 'High',
  },
  {
    id: 'INSP-2935',
    product: 'Wheat Flour (Atta) 10kg',
    manufacturer: 'Golden Harvest Co.',
    detectionDate: '2023-10-23',
    severity: 'Critical',
  },
  {
    id: 'INSP-2930',
    product: 'Cane Sugar 1kg',
    manufacturer: 'SweetLife Sugars',
    detectionDate: '2023-10-22',
    severity: 'Medium',
  },
]

export const complianceTrend = [
  68,
  71,
  66,
  69,
  72,
  70,
  73,
  74,
]

export const violationDistribution = [
  {
    label: 'Underweight (Net Qty)',
    percentage: 42,
  },
  {
    label: 'Labeling Error (MRP/Date)',
    percentage: 35,
  },
  {
    label: 'Packaging Defect',
    percentage: 15,
  },
  {
    label: 'Unregistered Manufacturer',
    percentage: 8,
  },
]

export const highPriorityActions: HighPriorityAction[] = [
  {
    id: 'ACTION-001',
    title: 'Notice issued to AgriFoods India Ltd.',
    description: 'Underweight violation > 5% on 5kg packaging.',
    time: '2h ago',
    severity: 'critical',
  },
  {
    id: 'ACTION-002',
    title: 'Re-inspection scheduled: SunPure Mills',
    description: 'Follow-up on labeling irregularities.',
    time: '5h ago',
    severity: 'high',
  },
]