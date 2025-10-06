import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET - Obține toți utilizatorii din nomenclator cu funcțiile și serviciile asociate
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const codServ = searchParams.get('codServ');
    const codFunctie = searchParams.get('codFunctie');
    
    const whereClause: { codServ?: string; codFunctie?: string } = {};
    if (codServ) whereClause.codServ = codServ;
    if (codFunctie) whereClause.codFunctie = codFunctie;
    
    const utilizatori = await prisma.nomUtilizatori.findMany({
      where: whereClause,
      include: {
        functie: true,
        serviciu: {
          include: {
            directie: true
          }
        },
        manager: true,
        subordinates: true
      },
      orderBy: {
        codUtilizator: 'asc'
      }
    });
    
    return NextResponse.json(utilizatori);
  } catch (error) {
    console.error('Eroare la obținerea utilizatorilor:', error);
    return NextResponse.json(
      { error: 'Eroare la obținerea utilizatorilor' },
      { status: 500 }
    );
  }
}

// POST - Creează un nou utilizator în nomenclator
export async function POST(request: NextRequest) {
  try {
    const { 
      codUtilizator, 
      denumireUtilizator, 
      codFunctie, 
      codServ,
      numarMatricol,
      email,
      managerId
    } = await request.json();
    
    if (!codUtilizator || !denumireUtilizator || !codFunctie || !codServ) {
      return NextResponse.json(
        { error: 'Cod utilizator, denumire, cod funcție și cod serviciu sunt obligatorii' },
        { status: 400 }
      );
    }
    
    // Verifică dacă funcția există
    const functie = await prisma.nomFunctii.findUnique({
      where: { codFunctie }
    });
    
    if (!functie) {
      return NextResponse.json(
        { error: 'Funcția specificată nu există' },
        { status: 404 }
      );
    }
    
    // Verifică dacă serviciul există
    const serviciu = await prisma.nomServicii.findUnique({
      where: { codServ }
    });
    
    if (!serviciu) {
      return NextResponse.json(
        { error: 'Serviciul specificat nu există' },
        { status: 404 }
      );
    }
    
    // Verifică dacă managerul există (dacă a fost specificat)
    if (managerId) {
      const manager = await prisma.nomUtilizatori.findUnique({
        where: { codUtilizator: managerId }
      });
      
      if (!manager) {
        return NextResponse.json(
          { error: 'Managerul specificat nu există' },
          { status: 404 }
        );
      }
    }
    
    const noulUtilizator = await prisma.nomUtilizatori.create({
      data: {
        codUtilizator,
        denumireUtilizator,
        codFunctie,
        codServ,
        numarMatricol,
        email,
        managerId
      },
      include: {
        functie: true,
        serviciu: {
          include: {
            directie: true
          }
        },
        manager: true
      }
    });
    
    return NextResponse.json(noulUtilizator, { status: 201 });
  } catch (error: unknown) {
    console.error('Eroare la crearea utilizatorului:', error);
    
    if (error && typeof error === 'object' && 'code' in error && error.code === 'P2002') {
      return NextResponse.json(
        { error: 'Codul utilizatorului sau email-ul există deja' },
        { status: 409 }
      );
    }
    
    return NextResponse.json(
      { error: 'Eroare la crearea utilizatorului' },
      { status: 500 }
    );
  }
}