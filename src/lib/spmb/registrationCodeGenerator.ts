import { db } from "../db/index";

/**
 * Generate registration code with configurable prefix, suffix, padding, and year code
 * Format: PREFIX + YEAR_CODE + PADDED_NUMBER + SUFFIX
 * Example: "DAFTAR24001" or "DAFTAR-2024-0001-2025"
 * Settings are per academic year
 */
export async function generateRegistrationCode(
  yearId: string
): Promise<string> {
  try {
    // Get registration code settings for this academic year
    let settings = await db.admissionRegistrationCodeSetting.findUnique({
      where: { tahunAjaranId: yearId },
    });

    if (!settings) {
      // Create default settings for this year if not exists
      const year = await db.tahunAjaran.findUnique({
        where: { id: yearId },
      });

      if (!year) {
        throw new Error("Academic year not found");
      }

      settings = await db.admissionRegistrationCodeSetting.create({
        data: {
          tahunAjaranId: yearId,
          prefix: "DAFTAR",
          suffix: "",
          padLength: 4,
          includeYearCode: true,
          nextNumber: 1,
        },
      });
    }

    // Get year code
    const year = await db.tahunAjaran.findUnique({
      where: { id: yearId },
    });

    let yearCode = "";
    if (settings.includeYearCode && year?.yearCode) {
      yearCode = year.yearCode;
    }

    // Build registration code
    const paddedNumber = String(settings.nextNumber).padStart(
      settings.padLength,
      "0"
    );
    const registrationCode =
      settings.prefix +
      yearCode +
      paddedNumber +
      (settings.suffix || "");

    // Validasi keunikan kode per tahun ajaran
    const existingCode = await db.applicant.findFirst({
      where: {
        registrationCode: registrationCode,
        // Validate that the applicant belongs to this academic year if possible
      },
    });

    if (existingCode) {
      // Jika kode sudah ada, increment counter dan coba lagi
      await db.admissionRegistrationCodeSetting.update({
        where: { tahunAjaranId: yearId },
        data: { nextNumber: settings.nextNumber + 1 },
      });
      
      // Recursive call untuk generate kode yang unik
      return generateRegistrationCode(yearId);
    }

    // Increment nextNumber for next code generation
    await db.admissionRegistrationCodeSetting.update({
      where: { tahunAjaranId: yearId },
      data: { nextNumber: settings.nextNumber + 1 },
    });

    return registrationCode;
  } catch (error) {
    console.error("Error generating registration code:", error);
    throw new Error("Failed to generate registration code");
  }
}

/**
 * Get current registration code settings for an academic year
 */
export async function getRegistrationCodeSettings(yearId: string) {
  try {
    let settings = await db.admissionRegistrationCodeSetting.findUnique({
      where: { tahunAjaranId: yearId },
    });

    if (!settings) {
      const year = await db.tahunAjaran.findUnique({
        where: { id: yearId },
      });

      if (!year) {
        throw new Error("Academic year not found");
      }

      settings = await db.admissionRegistrationCodeSetting.create({
        data: {
          tahunAjaranId: yearId,
          prefix: "DAFTAR",
          suffix: "",
          padLength: 4,
          includeYearCode: true,
          nextNumber: 1,
        },
      });
    }

    return settings;
  } catch (error) {
    console.error("Error fetching registration code settings:", error);
    throw error;
  }
}

/**
 * Reset registration code counter for an academic year
 */
export async function resetRegistrationCodeCounter(yearId: string, startNumber: number = 1) {
  try {
    let settings = await db.admissionRegistrationCodeSetting.findUnique({
      where: { tahunAjaranId: yearId },
    });

    if (!settings) {
      const year = await db.tahunAjaran.findUnique({
        where: { id: yearId },
      });

      if (!year) {
        throw new Error("Academic year not found");
      }

      settings = await db.admissionRegistrationCodeSetting.create({
        data: {
          tahunAjaranId: yearId,
          prefix: "DAFTAR",
          suffix: "",
          padLength: 4,
          includeYearCode: true,
          nextNumber: startNumber,
        },
      });
    } else {
      settings = await db.admissionRegistrationCodeSetting.update({
        where: { tahunAjaranId: yearId },
        data: { nextNumber: startNumber },
      });
    }

    return settings;
  } catch (error) {
    console.error("Error resetting registration code counter:", error);
    throw error;
  }
}

/**
 * Update registration code settings for an academic year
 */
export async function updateRegistrationCodeSettings(
  yearId: string,
  data: {
    prefix?: string;
    suffix?: string;
    padLength?: number;
    includeYearCode?: boolean;
  }
) {
  try {
    let settings = await db.admissionRegistrationCodeSetting.findUnique({
      where: { tahunAjaranId: yearId },
    });

    if (!settings) {
      const year = await db.tahunAjaran.findUnique({
        where: { id: yearId },
      });

      if (!year) {
        throw new Error("Academic year not found");
      }

      settings = await db.admissionRegistrationCodeSetting.create({
        data: {
          tahunAjaranId: yearId,
          prefix: data.prefix ?? "DAFTAR",
          suffix: data.suffix ?? "",
          padLength: data.padLength ?? 4,
          includeYearCode: data.includeYearCode ?? true,
          nextNumber: 1,
        },
      });
    } else {
      settings = await db.admissionRegistrationCodeSetting.update({
        where: { tahunAjaranId: yearId },
        data: {
          prefix: data.prefix ?? settings.prefix,
          suffix: data.suffix ?? settings.suffix,
          padLength: data.padLength ?? settings.padLength,
          includeYearCode:
            data.includeYearCode ?? settings.includeYearCode,
        },
      });
    }

    return settings;
  } catch (error) {
    console.error("Error updating registration code settings:", error);
    throw error;
  }
}
