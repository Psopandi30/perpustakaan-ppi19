// Database types untuk Supabase
// Auto-generated types bisa dibuat dengan: npx supabase gen types typescript --project-id YOUR_PROJECT_ID > lib/database.types.ts
// Untuk sekarang, kita buat manual berdasarkan schema

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: number
          nama_lengkap: string
          status: string
          alamat: string
          telepon: string
          username: string
          email: string | null
          akun_status: 'Aktif' | 'Tidak aktif'
          photo: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: number
          nama_lengkap: string
          status: string
          alamat: string
          telepon: string
          username: string
          email?: string | null
          akun_status?: 'Aktif' | 'Tidak aktif'
          photo?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: number
          nama_lengkap?: string
          status?: string
          alamat?: string
          telepon?: string
          username?: string
          email?: string | null
          akun_status?: 'Aktif' | 'Tidak aktif'
          photo?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      settings: {
        Row: {
          id: number
          library_name: string
          admin_password: string
          login_logo: string | null
          admin_photo: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: number
          library_name?: string
          admin_password?: string
          login_logo?: string | null
          admin_photo?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: number
          library_name?: string
          admin_password?: string
          login_logo?: string | null
          admin_photo?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      bulletins: {
        Row: {
          id: number
          judul: string
          cover_link: string | null
          draf_link: string
          nama_penulis: string
          tanggal_terbit: string
          content: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: number
          judul: string
          cover_link?: string | null
          draf_link: string
          nama_penulis: string
          tanggal_terbit: string
          content?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: number
          judul?: string
          cover_link?: string | null
          draf_link?: string
          nama_penulis?: string
          tanggal_terbit?: string
          content?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      written_works: {
        Row: {
          id: number
          judul: string
          nama_penulis: string
          tanggal_terbit: string
          cover_link: string | null
          draf_link: string
          content: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: number
          judul: string
          nama_penulis: string
          tanggal_terbit: string
          cover_link?: string | null
          draf_link: string
          content?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: number
          judul?: string
          nama_penulis?: string
          tanggal_terbit?: string
          cover_link?: string | null
          draf_link?: string
          content?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      general_books: {
        Row: {
          id: number
          judul: string
          nama_penulis: string
          tanggal_terbit: string
          cover_link: string | null
          draf_link: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: number
          judul: string
          nama_penulis: string
          tanggal_terbit: string
          cover_link?: string | null
          draf_link: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: number
          judul?: string
          nama_penulis?: string
          tanggal_terbit?: string
          cover_link?: string | null
          draf_link?: string
          created_at?: string
          updated_at?: string
        }
      }
      karya_asatidz: {
        Row: {
          id: number
          judul: string
          nama_penulis: string
          tanggal_terbit: string
          cover_link: string | null
          draf_link: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: number
          judul: string
          nama_penulis: string
          tanggal_terbit: string
          cover_link?: string | null
          draf_link: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: number
          judul?: string
          nama_penulis?: string
          tanggal_terbit?: string
          cover_link?: string | null
          draf_link?: string
          created_at?: string
          updated_at?: string
        }
      }
      materi_dakwah: {
        Row: {
          id: number
          judul: string
          nama_penulis: string
          tanggal_terbit: string
          cover_link: string | null
          draf_link: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: number
          judul: string
          nama_penulis: string
          tanggal_terbit: string
          cover_link?: string | null
          draf_link: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: number
          judul?: string
          nama_penulis?: string
          tanggal_terbit?: string
          cover_link?: string | null
          draf_link?: string
          created_at?: string
          updated_at?: string
        }
      }
      khutbah_jumat: {
        Row: {
          id: number
          judul: string
          nama_penulis: string
          tanggal_terbit: string
          cover_link: string | null
          draf_link: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: number
          judul: string
          nama_penulis: string
          tanggal_terbit: string
          cover_link?: string | null
          draf_link: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: number
          judul?: string
          nama_penulis?: string
          tanggal_terbit?: string
          cover_link?: string | null
          draf_link?: string
          created_at?: string
          updated_at?: string
        }
      }
      information: {
        Row: {
          id: number
          judul: string
          tanggal: string
          isi: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: number
          judul: string
          tanggal: string
          isi: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: number
          judul?: string
          tanggal?: string
          isi?: string
          created_at?: string
          updated_at?: string
        }
      }
      radio_stream_data: {
        Row: {
          id: number
          title: string
          youtube_link: string | null
          whatsapp_link: string | null
          is_published: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: number
          title: string
          youtube_link?: string | null
          whatsapp_link?: string | null
          is_published?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: number
          title?: string
          youtube_link?: string | null
          whatsapp_link?: string | null
          is_published?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      chat_messages: {
        Row: {
          id: number
          user_id: number | null
          sender: string
          message: string
          is_admin: boolean
          is_radio_message: boolean
          created_at: string
        }
        Insert: {
          id?: number
          user_id?: number | null
          sender: string
          message: string
          is_admin?: boolean
          is_radio_message?: boolean
          created_at?: string
        }
        Update: {
          id?: number
          user_id?: number | null
          sender?: string
          message?: string
          is_admin?: boolean
          is_radio_message?: boolean
          created_at?: string
        }
      }
      chat_threads: {
        Row: {
          user_id: number
          unread_by_admin: boolean
          unread_by_user: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          user_id: number
          unread_by_admin?: boolean
          unread_by_user?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          user_id?: number
          unread_by_admin?: boolean
          unread_by_user?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      notifications: {
        Row: {
          id: number
          user_id: number | null
          type: string
          title: string
          message: string
          is_read: boolean
          created_at: string
        }
        Insert: {
          id?: number
          user_id?: number | null
          type: string
          title: string
          message: string
          is_read?: boolean
          created_at?: string
        }
        Update: {
          id?: number
          user_id?: number | null
          type?: string
          title?: string
          message?: string
          is_read?: boolean
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}

