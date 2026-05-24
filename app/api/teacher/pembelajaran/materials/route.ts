import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { uploadFile, getFileExtension } from "@/lib/upload";

// Validation schema
const teachingMaterialSchema = z.object({
  title: z.string().min(1, "Judul harus diisi"),
  description: z.string().optional(),
  subjectId: z.string().transform((val) => BigInt(val)),
  classId: z.string().optional().transform((val) => val ? BigInt(val) : null),
  chapter: z.string().optional(),
  tags: z.string().optional(),
  externalLink: z.string().url().optional().or(z.literal("")),
  publishedAt: z.string().optional(),
});

const updateMaterialSchema = z.object({
  id: z.string().transform((val) => BigInt(val)),
  title: z.string().min(1, "Judul harus diisi").optional(),
  description: z.string().optional().nullable(),
  chapter: z.string().optional().nullable(),
  tags: z.string().optional().nullable(),
  fileType: z.string().optional().nullable(),
  externalLink: z.string().url().optional().or(z.literal("")).nullable(),
  publishedAt: z.string().optional().nullable(),
});

// GET - List materials with filters
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user || session.user.staffRole !== "TEACHER") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    const subjectId = searchParams.get("subjectId");
    const classId = searchParams.get("classId");
    const chapter = searchParams.get("chapter");
    const search = searchParams.get("search");
    const status = searchParams.get("status"); // published, draft
    const page = parseInt(searchParams.get("page") || "0");
    const pageSize = parseInt(searchParams.get("pageSize") || "10");

    const staffId = session.user.staffId!;

    // If ID is provided, fetch single item
    if (id) {
      const material = await prisma.teachingMaterial.findFirst({
        where: {
          id: BigInt(id),
          teacher_id: staffId,
          deleted_at: null,
        },
        include: {
          subject: {
            select: {
              id: true,
              name: true,
              code: true,
            },
          },
          class: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      });

      if (!material) {
        return NextResponse.json(
          { error: "Material not found" },
          { status: 404 }
        );
      }

      const serialized = {
        id: Number(material.id),
        title: material.title,
        description: material.description,
        subjectId: Number(material.subject_id),
        classId: material.class_id ? Number(material.class_id) : null,
        chapter: material.chapter,
        tags: material.tags,
        fileUrl: material.file_url,
        fileName: material.file_name,
        fileType: material.file_type,
        fileSize: material.file_size ? Number(material.file_size) : null,
        externalLink: material.external_link,
        publishedAt: material.published_at?.toISOString(),
        views: material.views,
        downloads: material.downloads,
        createdAt: material.created_at.toISOString(),
        updatedAt: material.updated_at.toISOString(),
        subject: {
          id: Number(material.subject.id),
          name: material.subject.name,
          code: material.subject.code,
        },
        class: material.class
          ? {
              id: Number(material.class.id),
              name: material.class.name,
            }
          : null,
      };

      return NextResponse.json(serialized);
    }

    // Build where clause
    const where: {
      teacher_id: string;
      deleted_at: null;
      subject_id?: bigint;
      class_id?: bigint;
      chapter?: { contains: string; mode: "insensitive" };
      OR?: Array<{
        title?: { contains: string; mode: "insensitive" };
        description?: { contains: string; mode: "insensitive" };
        tags?: { contains: string; mode: "insensitive" };
      }>;
      published_at?: { lte: Date } | null;
    } = {
      teacher_id: staffId,
      deleted_at: null,
    };

    if (subjectId) {
      where.subject_id = BigInt(subjectId);
    }

    if (classId) {
      where.class_id = BigInt(classId);
    }

    if (chapter) {
      where.chapter = { contains: chapter, mode: "insensitive" };
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
        { tags: { contains: search, mode: "insensitive" } },
      ];
    }

    if (status === "published") {
      where.published_at = { lte: new Date() };
    } else if (status === "draft") {
      where.published_at = null;
    }

    // Get total count
    const totalCount = await prisma.teachingMaterial.count({ where });

    // Fetch materials
    const materials = await prisma.teachingMaterial.findMany({
      where,
      skip: page * pageSize,
      take: pageSize,
      include: {
        subject: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
        class: {
          select: {
            id: true,
            name: true,
          },
        },
        teacher: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: {
        created_at: "desc",
      },
    });

    // Transform BigInt to string for JSON serialization
    const materialsData = materials.map((material) => ({
      id: Number(material.id),
      teacherId: material.teacher_id,
      subjectId: Number(material.subject_id),
      classId: material.class_id ? Number(material.class_id) : null,
      title: material.title,
      description: material.description,
      fileUrl: material.file_url,
      fileType: material.file_type,
      fileName: material.file_name,
      fileSize: material.file_size ? Number(material.file_size) : null,
      externalLink: material.external_link,
      chapter: material.chapter,
      tags: material.tags,
      publishedAt: material.published_at?.toISOString() || null,
      views: material.views,
      downloads: material.downloads,
      createdAt: material.created_at.toISOString(),
      updatedAt: material.updated_at.toISOString(),
      subject: {
        id: Number(material.subject.id),
        name: material.subject.name,
        code: material.subject.code,
      },
      class: material.class ? {
        id: Number(material.class.id),
        name: material.class.name,
      } : null,
      teacher: {
        id: material.teacher.id,
        name: material.teacher.name,
      },
    }));

    return NextResponse.json({ 
      items: materialsData,
      totalCount,
      page,
      pageSize
    });
  } catch (error) {
    console.error("Error fetching teaching materials:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST - Upload new material
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user || session.user.staffRole !== "TEACHER") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const staffId = session.user.staffId!;

    // Check content type to determine if it's JSON or FormData
    const contentType = req.headers.get("content-type");
    const isJson = contentType?.includes("application/json");

    let title: string;
    let description: string | null;
    let subjectId: string;
    let classId: string | null;
    let chapter: string | null;
    let tags: string | null;
    let externalLink: string | null;
    let fileType: string | null = null;
    let publishedAt: string | null;
    let file: File | null = null;

    if (isJson) {
      // Parse JSON body (for external links)
      const body = await req.json();
      title = body.title;
      description = body.description;
      subjectId = body.subjectId?.toString();
      classId = body.classId?.toString() || null;
      chapter = body.chapter || null;
      tags = body.tags || null;
      externalLink = body.externalLink;
      fileType = body.fileType || null;
      publishedAt = body.publishedAt || null;
    } else {
      // Parse form data (for file uploads)
      const formData = await req.formData();
      title = formData.get("title") as string;
      description = formData.get("description") as string | null;
      subjectId = formData.get("subjectId") as string;
      classId = formData.get("classId") as string | null;
      chapter = formData.get("chapter") as string | null;
      tags = formData.get("tags") as string | null;
      externalLink = formData.get("externalLink") as string | null;
      publishedAt = formData.get("publishedAt") as string | null;
      file = formData.get("file") as File | null;
    }

    // Validate required fields
    const validated = teachingMaterialSchema.parse({
      title,
      description: description || undefined,
      subjectId,
      classId: classId || undefined,
      chapter: chapter || undefined,
      tags: tags || undefined,
      externalLink: externalLink || undefined,
      publishedAt: publishedAt || undefined,
    });

    // Verify teacher has access to this subject
    const teacherSubject = await prisma.teacherSubject.findFirst({
      where: {
        teacher_id: staffId,
        subject_id: validated.subjectId,
        deleted_at: null,
      },
    });

    if (!teacherSubject) {
      return NextResponse.json(
        { error: "You don't have access to this subject" },
        { status: 403 }
      );
    }

    let fileUrl: string | null = null;
    let finalFileType: string | null = null;
    let fileName: string | null = null;
    let fileSize: bigint | null = null;

    // Handle file upload
    if (file && file.size > 0) {
      const uploadResult = await uploadFile(file, "materials");
      fileUrl = uploadResult.url;
      finalFileType = getFileExtension(file.name);
      fileName = file.name;
      fileSize = BigInt(uploadResult.size);
    } else if (externalLink) {
      // External link - use the provided fileType or default to "link"
      finalFileType = fileType || "link";
    }

    // Create material
    const material = await prisma.teachingMaterial.create({
      data: {
        teacher_id: staffId,
        subject_id: validated.subjectId,
        class_id: validated.classId,
        title: validated.title,
        description: validated.description || null,
        file_url: fileUrl,
        file_type: finalFileType,
        file_name: fileName,
        file_size: fileSize,
        external_link: validated.externalLink || null,
        chapter: validated.chapter || null,
        tags: validated.tags || null,
        published_at: validated.publishedAt
          ? new Date(validated.publishedAt)
          : new Date(), // Default to now
      },
      include: {
        subject: true,
        class: true,
      },
    });

    return NextResponse.json({
      message: "Material berhasil diupload",
      material: {
        id: Number(material.id),
        title: material.title,
        fileUrl: material.file_url,
      },
    });
  } catch (error) {
    console.error("Error uploading material:", error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.issues },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// PUT - Update material
export async function PUT(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user || session.user.staffRole !== "TEACHER") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const staffId = session.user.staffId!;
    const body = await req.json();

    const validated = updateMaterialSchema.parse(body);

    // Check ownership
    const material = await prisma.teachingMaterial.findFirst({
      where: {
        id: validated.id,
        teacher_id: staffId,
        deleted_at: null,
      },
    });

    if (!material) {
      return NextResponse.json(
        { error: "Material not found or you don't have permission" },
        { status: 404 }
      );
    }

    // Update material
    const updateData: {
      title?: string;
      description?: string | null;
      subject_id?: bigint;
      class_id?: bigint | null;
      chapter?: string | null;
      tags?: string | null;
      file_type?: string | null;
      external_link?: string | null;
      published_at?: Date | null;
    } = {};

    if (validated.title) updateData.title = validated.title;
    if (validated.description !== undefined) updateData.description = validated.description;
    if (validated.chapter !== undefined) updateData.chapter = validated.chapter;
    if (validated.tags !== undefined) updateData.tags = validated.tags;
    if (validated.fileType !== undefined) updateData.file_type = validated.fileType;
    if (validated.externalLink !== undefined) {
      updateData.external_link = validated.externalLink || null;
    }
    if (validated.publishedAt !== undefined) {
      updateData.published_at = validated.publishedAt
        ? new Date(validated.publishedAt)
        : null;
    }

    const updatedMaterial = await prisma.teachingMaterial.update({
      where: { id: validated.id },
      data: updateData,
    });

    return NextResponse.json({
      message: "Material berhasil diupdate",
      material: {
        id: Number(updatedMaterial.id),
        title: updatedMaterial.title,
      },
    });
  } catch (error) {
    console.error("Error updating material:", error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.issues },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE - Soft delete material
export async function DELETE(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user || session.user.staffRole !== "TEACHER") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const staffId = session.user.staffId!;
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "Material ID is required" },
        { status: 400 }
      );
    }

    // Check ownership
    const material = await prisma.teachingMaterial.findFirst({
      where: {
        id: BigInt(id),
        teacher_id: staffId,
        deleted_at: null,
      },
    });

    if (!material) {
      return NextResponse.json(
        { error: "Material not found or you don't have permission" },
        { status: 404 }
      );
    }

    // Soft delete
    await prisma.teachingMaterial.update({
      where: { id: BigInt(id) },
      data: { deleted_at: new Date() },
    });

    return NextResponse.json({
      message: "Material berhasil dihapus",
    });
  } catch (error) {
    console.error("Error deleting material:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
