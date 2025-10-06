import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET - Obține toate direcțiile
export async function GET() {
  try {
    const directii = await prisma.nomDirectie.findMany({
      orderBy: {
        codDir: 'asc'
      }
    });
    
    return NextResponse.json(directii);
  } catch (error) {
    console.error('Eroare la obținerea direcțiilor:', error);
    return NextResponse.json(
      { error: 'Eroare la obținerea direcțiilor' },
      { status: 500 }
    );
  }
}

// POST - Creează o nouă direcție
export async function POST(request: NextRequest) {
  try {
    const { codDir, denumireDir } = await request.json();
    
    if (!codDir || !denumireDir) {
      return NextResponse.json(
        { error: 'Cod direcție și denumire sunt obligatorii' },
        { status: 400 }
      );
    }
    
    const nouaDirectie = await prisma.nomDirectie.create({
      data: {
        codDir,
        denumireDir
      }
    });
    
    return NextResponse.json(nouaDirectie, { status: 201 });
  } catch (error: unknown) {
    console.error('Eroare la crearea direcției:', error);
    
    if (error && typeof error === 'object' && 'code' in error && error.code === 'P2002') {
      return NextResponse.json(
        { error: 'Codul direcției există deja' },
        { status: 409 }
      );
    }
    
    return NextResponse.json(
      { error: 'Eroare la crearea direcției' },
      { status: 500 }
    );
  }
}