import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET - Obține toate funcțiile
export async function GET() {
  try {
    const functii = await prisma.nomFunctii.findMany({
      orderBy: {
        codFunctie: 'asc'
      }
    });
    
    return NextResponse.json(functii);
  } catch (error) {
    console.error('Eroare la obținerea funcțiilor:', error);
    return NextResponse.json(
      { error: 'Eroare la obținerea funcțiilor' },
      { status: 500 }
    );
  }
}

// POST - Creează o nouă funcție
export async function POST(request: NextRequest) {
  try {
    const { codFunctie, tipFunctie, denumireFunctie } = await request.json();
    
    if (!codFunctie || !tipFunctie || !denumireFunctie) {
      return NextResponse.json(
        { error: 'Cod funcție, tip funcție și denumire sunt obligatorii' },
        { status: 400 }
      );
    }
    
    const nouaFunctie = await prisma.nomFunctii.create({
      data: {
        codFunctie,
        tipFunctie,
        denumireFunctie
      }
    });
    
    return NextResponse.json(nouaFunctie, { status: 201 });
  } catch (error: unknown) {
    console.error('Eroare la crearea funcției:', error);
    
    if (error && typeof error === 'object' && 'code' in error && error.code === 'P2002') {
      return NextResponse.json(
        { error: 'Codul funcției sau tipul funcției există deja' },
        { status: 409 }
      );
    }
    
    return NextResponse.json(
      { error: 'Eroare la crearea funcției' },
      { status: 500 }
    );
  }
}