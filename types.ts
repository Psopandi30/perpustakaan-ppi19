import React from 'react';

export interface NavItemType {
  id: string;
  label: string;
  icon: React.ElementType;
}

export interface User {
  id: number;
  namaLengkap: string;
  status: string;
  alamat: string;
  telepon: string;
  username: string;
  akunStatus: 'Aktif' | 'Tidak aktif';
  password?: string;
  photo?: string;
}

export interface ChatMessage {
  id: number;
  sender: string;
  message: string;
  isAdmin: boolean;
  timestamp: Date;
}

export interface ChatThread {
  messages: ChatMessage[];
  unreadByAdmin: boolean;
  unreadByUser: boolean;
}

export interface RadioStreamData {
    title: string;
    youtubeLink: string;
    whatsappLink: string;
    isPublished: boolean;
    messages: ChatMessage[];
}

export interface Bulletin {
  id: number;
  judul: string;
  coverLink: string;
  drafLink: string;
  namaPenulis: string;
  tanggalTerbit: string;
  content: string;
}

export interface WrittenWork {
  id: number;
  judul: string;
  namaPenulis: string;
  tanggalTerbit: string;
  coverLink: string;
  drafLink: string;
  content: string;
}

export interface GeneralBook {
  id: number;
  judul: string;
  namaPenulis: string;
  tanggalTerbit: string;
  coverLink: string;
  drafLink: string;
}

export interface KaryaAsatidz {
  id: number;
  judul: string;
  namaPenulis: string;
  tanggalTerbit: string;
  coverLink: string;
  drafLink: string;
}

export interface MateriDakwah {
  id: number;
  judul: string;
  namaPenulis: string;
  tanggalTerbit: string;
  coverLink: string;
  drafLink: string;
}

export interface KhutbahJumat {
  id: number;
  judul: string;
  namaPenulis: string;
  tanggalTerbit: string;
  coverLink: string;
  drafLink: string;
}

// FIX: Add the missing 'Hadith' type definition.
export interface Hadith {
  id: number;
  nama: string;
  coverLink: string;
  bukuLink: string;
}

export interface Information {
  id: number;
  judul: string;
  tanggal: string;
  isi: string;
}

export interface UserDashboardGridItem {
    id: string;
    label: string;
    icon: React.ElementType;
}

// Types for Quran API (api.quran.com)
export interface QuranChapter {
    id: number;
    name_simple: string;
    name_arabic: string;
    revelation_place: string;
    verses_count: number;
    translated_name: {
        name: string;
    }
}

export interface QuranVerse {
    id: number;
    verse_number: number;
    text_imlaei: string; // Simple Imlaei script (plain text)
    translation: string; // Indonesian translation
}

export interface QuranSurahDetail {
    id: number;
    name_simple: string;
    name_arabic: string;
    revelation_place: string;
    verses_count: number;
    bismillah_pre: boolean;
    verses: QuranVerse[];
}

export interface Settings {
    libraryName: string;
    adminPassword: string;
    loginLogo: string;
    adminPhoto: string;
}

export interface Notification {
    id: number;
    type: 'live-streaming' | 'buletin' | 'karya-tulis' | 'buku-umum' | 'karya-asatidz' | 'materi-dakwah' | 'khutbah-jumat' | 'informasi';
    title: string;
    message: string;
    timestamp: Date;
    isRead: boolean;
}