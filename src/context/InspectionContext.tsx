import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import type { AIComplianceResult } from "../services/aiComplianceService";
export interface Inspection {
  id: string;
  productName: string;
  manufacturer: string;
  location: string;
  inspector: string;
  date: string;

  status:
    | "draft"
    | "analyzing"
    | "review"
    | "completed"
    | "non-compliant";

  images: string[];

  extractedData: {
  netQuantity?: string;
  mrp?: string;
  manufacturingDate?: string;
  expiryDate?: string;
  batchNumber?: string;
  consumerCare?: string;
  manufacturer?: string;
};

aiCompliance?: AIComplianceResult;

  ocrText?: string;
  ocrConfidence?: number;

  compliance: {
    score: number;
    passed: number;
    failed: number;
    review: number;
    overallStatus: "COMPLIANT" | "NON-COMPLIANT" | "REVIEW_PENDING";
  };


  violation?: {
    title: string;
    reason: string;
    severity: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
    confidence: number;
    rule: string;
  };

  inspectorNotes?: string;
  confirmed?: boolean;
}

interface InspectionContextType {
  inspections: Inspection[];
  currentInspection: Inspection | null;
  storageLoaded: boolean;

  createInspection: (
  data: Omit<
    Inspection,
    "id" | "date" | "status" | "extractedData" | "compliance"
  >
) => Inspection;

  updateInspection: (
    id: string,
    updates: Partial<Inspection>
  ) => void;

  getInspection: (id: string) => Inspection | null;

  setCurrentInspection: (inspection: Inspection | null) => void;
}

const InspectionContext =
  createContext<InspectionContextType | undefined>(undefined);

const STORAGE_KEY = "satyascan_inspections";

export function InspectionProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [inspections, setInspections] = useState<Inspection[]>([]);
  const [storageLoaded, setStorageLoaded] = useState(false);
  const [currentInspection, setCurrentInspection] =
    useState<Inspection | null>(null);

  useEffect(() => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);

    if (saved) {
      const parsed = JSON.parse(saved);

      if (Array.isArray(parsed)) {
        setInspections(parsed);
      }
    }
  } catch (error) {
    console.error(
      "Unable to load SatyaScan inspections.",
      error,
    );
  } finally {
    setStorageLoaded(true);
  }
}, []);
  useEffect(() => {
  if (!storageLoaded) return;

  try {
    // Images can be large, so don't allow a storage failure
    // to crash the entire SatyaScan application.
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(inspections),
    )
  } catch (error) {
    if (
      error instanceof DOMException &&
      error.name === 'QuotaExceededError'
    ) {
      console.warn(
        'SatyaScan storage quota exceeded. Large inspection images should be stored outside localStorage.',
      )
      return
    }

    console.error(
      'Unable to save SatyaScan inspections.',
      error,
    )
  }
}, [inspections, storageLoaded]);
  const createInspection = (
  data: Omit<
    Inspection,
    "id" | "date" | "status" | "extractedData" | "compliance"
  >
) => {
    const inspection: Inspection = {
      ...data,

      id: `INSP-${Math.floor(
        1000 + Math.random() * 9000
      )}`,

      date: new Date().toISOString(),

      status: "draft",

      images: data.images,

      extractedData: {},

      compliance: {
        score: 0,
        passed: 0,
        failed: 0,
        review: 0,
        overallStatus: "REVIEW_PENDING",
      },
    };

    setInspections((previous) => [
      inspection,
      ...previous,
    ]);

    setCurrentInspection(inspection);

    return inspection;
  };

  const updateInspection = useCallback(
  (id: string, updates: Partial<Inspection>) => {
    setInspections((previous) => {
      let changed = false;

      const next = previous.map((inspection) => {
        if (inspection.id !== id) {
          return inspection;
        }

        changed = true;

        return {
          ...inspection,
          ...updates,
        };
      });

      return changed ? next : previous;
    });

    setCurrentInspection((previous) => {
      if (!previous || previous.id !== id) {
        return previous;
      }

      return {
        ...previous,
        ...updates,
      };
    });
  },
  [],
);

  const getInspection = (id: string) => {
    return (
      inspections.find(
        (inspection) => inspection.id === id
      ) || null
    );
  };

  return (
    <InspectionContext.Provider
      value={{
  inspections,
  currentInspection,
  storageLoaded,
  createInspection,
  updateInspection,
  getInspection,
  setCurrentInspection,
}}
    >
      {children}
    </InspectionContext.Provider>
  );
}

export function useInspections() {
  const context = useContext(InspectionContext);

  if (!context) {
    throw new Error(
      "useInspections must be used inside InspectionProvider"
    );
  }

  return context;
}