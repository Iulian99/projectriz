import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET - Obține toate serviciile cu direcțiile asociate
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const codDir = searchParams.get('codDir');
    
    const whereClause = codDir ? { codDir } : {};
    
    const servicii = await prisma.nomServicii.findMany({
      where: whereClause,
      include: {
        directie: true
      },
      orderBy: {
        codServ: 'asc'
      }
    });
    
    return NextResponse.json(servicii);
  } catch (error) {
    console.error('Eroare la obținerea serviciilor:', error);
    return NextResponse.json(
      { error: 'Eroare la obținerea serviciilor' },
      { status: 500 }
    );
  }
}

// POST - Creează un nou serviciu
export async function POST(request: NextRequest) {
  try {
    const { codServ, denumireServ, codDir } = await request.json();
    
    if (!codServ || !denumireServ || !codDir) {
      return NextResponse.json(
        { error: 'Cod serviciu, denumire și cod direcție sunt obligatorii' },
        { status: 400 }
      );
    }
    
    // Verifică dacă direcția există
    const directie = await prisma.nomDirectie.findUnique({
      where: { codDir }
    });
    
    if (!directie) {
      return NextResponse.json(
        { error: 'Direcția specificată nu există' },
        { status: 404 }
      );
    }
    
    const noulServiciu = await prisma.nomServicii.create({
      data: {
        codServ,
        denumireServ,
        codDir
      },
      include: {
        directie: true
      }
    });
    
    return NextResponse.json(noulServiciu, { status: 201 });
  } catch (error: unknown) {
    console.error('Eroare la crearea serviciului:', error);
    
    if (error && typeof error === 'object' && 'code' in error && error.code === 'P2002') {
      return NextResponse.json(
        { error: 'Codul serviciului există deja' },
        { status: 409 }
      );
    }
    
    return NextResponse.json(
      { error: 'Eroare la crearea serviciului' },
      { status: 500 }
    );
  }
}