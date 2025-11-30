import type { User, RadioStreamData, Information, ChatThread, Bulletin, WrittenWork, GeneralBook, KaryaAsatidz, MateriDakwah, KhutbahJumat, Settings, Notification, ChatMessage } from './types';
import { supabase } from './lib/supabase';

// --- Helper Types for Supabase Responses ---
// We define these locally to map snake_case from DB to camelCase in App

// --- Users ---
export const fetchUsers = async (): Promise<User[]> => {
    const { data, error } = await (supabase as any)
        .from('users')
        .select('*')
        .order('id', { ascending: true });

    if (error) {
        console.error('Error fetching users:', error);
        return [];
    }

    return (data as any[] || []).map(u => ({
        id: u.id,
        namaLengkap: u.nama_lengkap,
        status: u.status,
        alamat: u.alamat,
        telepon: u.telepon,
        username: u.username,
        akunStatus: u.akun_status as 'Aktif' | 'Tidak aktif',
        password: u.password,
        photo: u.photo || undefined
    }));
};

export const addUser = async (user: Omit<User, 'id'>): Promise<User | null> => {
    const dbUser = {
        nama_lengkap: user.namaLengkap,
        status: user.status,
        alamat: user.alamat,
        telepon: user.telepon,
        username: user.username,
        akun_status: user.akunStatus,
        password: user.password || 'password',
        photo: user.photo || null
    };

    console.log('Attempting to add user:', dbUser);

    const { data, error } = await (supabase as any)
        .from('users')
        .insert(dbUser as any)
        .select()
        .single();

    if (error) {
        console.error('Error adding user - Full error:', error);
        console.error('Error message:', error.message);
        console.error('Error details:', error.details);
        console.error('Error hint:', error.hint);
        alert(`Gagal menambahkan user: ${error.message || 'Unknown error'}`);
        return null;
    }

    const u = data as any;
    return {
        id: u.id,
        namaLengkap: u.nama_lengkap,
        status: u.status,
        alamat: u.alamat,
        telepon: u.telepon,
        username: u.username,
        akunStatus: u.akun_status,
        password: u.password,
        photo: u.photo
    };
};

export const updateUser = async (user: User): Promise<boolean> => {
    const dbUser = {
        nama_lengkap: user.namaLengkap,
        status: user.status,
        alamat: user.alamat,
        telepon: user.telepon,
        username: user.username,
        akun_status: user.akunStatus,
        password: user.password,
        photo: user.photo
    };

    const { error } = await supabase
        .from('users')
        .update(dbUser as any)
        .eq('id', user.id);

    if (error) {
        console.error('Error updating user:', error);
        return false;
    }
    return true;
};

export const deleteUser = async (id: number): Promise<boolean> => {
    const { error } = await supabase.from('users').delete().eq('id', id);
    if (error) {
        console.error('Error deleting user:', error);
        return false;
    }
    return true;
};

// --- Bulletins ---
export const fetchBulletins = async (): Promise<Bulletin[]> => {
    const { data, error } = await supabase.from('bulletins').select('*').order('id', { ascending: false });
    if (error) {
        console.error('Error fetching bulletins:', error);
        return [];
    }
    return (data as any[] || []).map(b => ({
        id: b.id,
        judul: b.judul,
        coverLink: b.cover_link,
        drafLink: b.draf_link,
        namaPenulis: b.nama_penulis,
        tanggalTerbit: b.tanggal_terbit,
        content: b.content
    }));
};

export const addBulletin = async (bulletin: Omit<Bulletin, 'id'>): Promise<Bulletin | null> => {
    const dbBulletin = {
        judul: bulletin.judul,
        cover_link: bulletin.coverLink,
        draf_link: bulletin.drafLink,
        nama_penulis: bulletin.namaPenulis,
        tanggal_terbit: bulletin.tanggalTerbit,
        content: bulletin.content
    };
    const { data, error } = await supabase.from('bulletins').insert(dbBulletin as any).select().single();
    if (error) {
        console.error('Error adding bulletin:', error);
        return null;
    }
    const b = data as any;
    return {
        id: b.id,
        judul: b.judul,
        coverLink: b.cover_link,
        drafLink: b.draf_link,
        namaPenulis: b.nama_penulis,
        tanggalTerbit: b.tanggal_terbit,
        content: b.content
    };
};

export const updateBulletin = async (bulletin: Bulletin): Promise<boolean> => {
    const dbBulletin = {
        judul: bulletin.judul,
        cover_link: bulletin.coverLink,
        draf_link: bulletin.drafLink,
        nama_penulis: bulletin.namaPenulis,
        tanggal_terbit: bulletin.tanggalTerbit,
        content: bulletin.content
    };
    const { error } = await supabase.from('bulletins').update(dbBulletin as any).eq('id', bulletin.id);
    return !error;
};

export const deleteBulletin = async (id: number): Promise<boolean> => {
    const { error } = await supabase.from('bulletins').delete().eq('id', id);
    return !error;
};

// --- Radio Stream ---
export const fetchRadioStreamData = async (): Promise<RadioStreamData> => {
    const { data, error } = await supabase.from('radio_stream_data').select('*').single();

    // Fetch messages for this stream (or global for now)
    const messages = await fetchChatMessages();

    if (error || !data) {
        // Return default if not found
        return {
            title: 'Radio Stream',
            youtubeLink: '',
            whatsappLink: '',
            isPublished: false,
            messages: messages
        };
    }

    const d = data as any;
    return {
        id: d.id,
        title: d.title,
        youtubeLink: d.youtube_link,
        whatsappLink: d.whatsapp_link,
        isPublished: d.is_published,
        messages: messages
    };
};

export const updateRadioStreamData = async (data: Partial<RadioStreamData>): Promise<boolean> => {
    // Build update object with only defined fields
    const dbData: any = {};

    if (data.title !== undefined) dbData.title = data.title;
    if (data.youtubeLink !== undefined) dbData.youtube_link = data.youtubeLink;
    if (data.whatsappLink !== undefined) dbData.whatsapp_link = data.whatsappLink;
    if (data.isPublished !== undefined) dbData.is_published = data.isPublished;

    // Use update instead of upsert to avoid RLS issues with insert permissions
    // Use the ID from data if available, otherwise default to 1
    const targetId = data.id || 1;

    const { error } = await supabase
        .from('radio_stream_data')
        .update(dbData)
        .eq('id', targetId);
    return !error;
};

// --- Chat ---
export const fetchChatMessages = async (): Promise<ChatMessage[]> => {
    const { data, error } = await supabase
        .from('chat_messages')
        .select('*')
        .order('created_at', { ascending: true });

    if (error) return [];

    return (data as any[] || []).map(m => ({
        id: m.id,
        sender: m.sender,
        message: m.message,
        isAdmin: m.is_admin,
        timestamp: new Date(m.created_at)
    }));
};

export const sendChatMessage = async (message: Omit<ChatMessage, 'id' | 'timestamp'>): Promise<ChatMessage | null> => {
    const dbMessage = {
        sender: message.sender,
        message: message.message,
        is_admin: message.isAdmin
    };
    const { data, error } = await supabase
        .from('chat_messages')
        .insert(dbMessage)
        .select()
        .single();

    if (error || !data) return null;

    const d = data as any;
    return {
        id: d.id,
        sender: d.sender,
        message: d.message,
        isAdmin: d.is_admin,
        timestamp: new Date(d.created_at)
    };
};

export const clearRadioChatMessages = async (): Promise<boolean> => {
    const { error } = await supabase
        .from('chat_messages')
        .delete()
        .eq('is_radio_message', true);
    return !error;
};

// --- Written Works (Skripsi/Jurnal) ---
export const fetchWrittenWorks = async (): Promise<WrittenWork[]> => {
    const { data, error } = await supabase.from('written_works').select('*');
    if (error) return [];
    return (data as any[]).map(w => ({
        id: w.id,
        judul: w.judul,
        namaPenulis: w.nama_penulis,
        tanggalTerbit: w.tanggal_terbit,
        coverLink: w.cover_link,
        drafLink: w.draf_link,
        content: w.content
    }));
};

export const addWrittenWork = async (work: Omit<WrittenWork, 'id'>): Promise<WrittenWork | null> => {
    const dbWork = {
        judul: work.judul,
        nama_penulis: work.namaPenulis,
        tanggal_terbit: work.tanggalTerbit,
        cover_link: work.coverLink,
        draf_link: work.drafLink,
        content: work.content
    };
    const { data, error } = await supabase.from('written_works').insert(dbWork as any).select().single();
    if (error) return null;
    const d = data as any;
    return {
        id: d.id,
        judul: d.judul,
        namaPenulis: d.nama_penulis,
        tanggalTerbit: d.tanggal_terbit,
        coverLink: d.cover_link,
        drafLink: d.draf_link,
        content: d.content
    };
};

export const updateWrittenWork = async (work: WrittenWork): Promise<boolean> => {
    const dbWork = {
        judul: work.judul,
        nama_penulis: work.namaPenulis,
        tanggal_terbit: work.tanggalTerbit,
        cover_link: work.coverLink,
        draf_link: work.drafLink,
        content: work.content
    };
    const { error } = await supabase.from('written_works').update(dbWork as any).eq('id', work.id);
    return !error;
};

export const deleteWrittenWork = async (id: number): Promise<boolean> => {
    const { error } = await supabase.from('written_works').delete().eq('id', id);
    return !error;
};

// --- General Books ---
export const fetchGeneralBooks = async (): Promise<GeneralBook[]> => {
    const { data, error } = await supabase.from('general_books').select('*');
    if (error) return [];
    return (data as any[]).map(b => ({
        id: b.id,
        judul: b.judul,
        namaPenulis: b.nama_penulis,
        tanggalTerbit: b.tanggal_terbit,
        coverLink: b.cover_link,
        drafLink: b.draf_link
    }));
};

export const addGeneralBook = async (book: Omit<GeneralBook, 'id'>): Promise<GeneralBook | null> => {
    const dbBook = {
        judul: book.judul,
        nama_penulis: book.namaPenulis,
        tanggal_terbit: book.tanggalTerbit,
        cover_link: book.coverLink,
        draf_link: book.drafLink
    };
    const { data, error } = await supabase.from('general_books').insert(dbBook as any).select().single();
    if (error) return null;
    const d = data as any;
    return {
        id: d.id,
        judul: d.judul,
        namaPenulis: d.nama_penulis,
        tanggalTerbit: d.tanggal_terbit,
        coverLink: d.cover_link,
        drafLink: d.draf_link
    };
};

export const updateGeneralBook = async (book: GeneralBook): Promise<boolean> => {
    const dbBook = {
        judul: book.judul,
        nama_penulis: book.namaPenulis,
        tanggal_terbit: book.tanggalTerbit,
        cover_link: book.coverLink,
        draf_link: book.drafLink
    };
    const { error } = await supabase.from('general_books').update(dbBook as any).eq('id', book.id);
    return !error;
};

export const deleteGeneralBook = async (id: number): Promise<boolean> => {
    const { error } = await supabase.from('general_books').delete().eq('id', id);
    return !error;
};

// --- Karya Asatidz ---
export const fetchKaryaAsatidz = async (): Promise<KaryaAsatidz[]> => {
    const { data, error } = await supabase.from('karya_asatidz').select('*');
    if (error) return [];
    return (data as any[]).map(k => ({
        id: k.id,
        judul: k.judul,
        namaPenulis: k.nama_penulis,
        tanggalTerbit: k.tanggal_terbit,
        coverLink: k.cover_link,
        drafLink: k.draf_link
    }));
};

export const addKaryaAsatidz = async (karya: Omit<KaryaAsatidz, 'id'>): Promise<KaryaAsatidz | null> => {
    const dbKarya = {
        judul: karya.judul,
        nama_penulis: karya.namaPenulis,
        tanggal_terbit: karya.tanggalTerbit,
        cover_link: karya.coverLink,
        draf_link: karya.drafLink
    };
    const { data, error } = await supabase.from('karya_asatidz').insert(dbKarya as any).select().single();
    if (error) return null;
    const d = data as any;
    return {
        id: d.id,
        judul: d.judul,
        namaPenulis: d.nama_penulis,
        tanggalTerbit: d.tanggal_terbit,
        coverLink: d.cover_link,
        drafLink: d.draf_link
    };
};

export const updateKaryaAsatidz = async (karya: KaryaAsatidz): Promise<boolean> => {
    const dbKarya = {
        judul: karya.judul,
        nama_penulis: karya.namaPenulis,
        tanggal_terbit: karya.tanggalTerbit,
        cover_link: karya.coverLink,
        draf_link: karya.drafLink
    };
    const { error } = await supabase.from('karya_asatidz').update(dbKarya as any).eq('id', karya.id);
    return !error;
};

export const deleteKaryaAsatidz = async (id: number): Promise<boolean> => {
    const { error } = await supabase.from('karya_asatidz').delete().eq('id', id);
    return !error;
};

// --- Materi Dakwah ---
export const fetchMateriDakwah = async (): Promise<MateriDakwah[]> => {
    const { data, error } = await supabase.from('materi_dakwah').select('*');
    if (error) return [];
    return (data as any[]).map(m => ({
        id: m.id,
        judul: m.judul,
        namaPenulis: m.nama_penulis,
        tanggalTerbit: m.tanggal_terbit,
        coverLink: m.cover_link,
        drafLink: m.draf_link
    }));
};

export const addMateriDakwah = async (materi: Omit<MateriDakwah, 'id'>): Promise<MateriDakwah | null> => {
    const dbMateri = {
        judul: materi.judul,
        nama_penulis: materi.namaPenulis,
        tanggal_terbit: materi.tanggalTerbit,
        cover_link: materi.coverLink,
        draf_link: materi.drafLink
    };
    const { data, error } = await supabase.from('materi_dakwah').insert(dbMateri as any).select().single();
    if (error) return null;
    const d = data as any;
    return {
        id: d.id,
        judul: d.judul,
        namaPenulis: d.nama_penulis,
        tanggalTerbit: d.tanggal_terbit,
        coverLink: d.cover_link,
        drafLink: d.draf_link
    };
};

export const updateMateriDakwah = async (materi: MateriDakwah): Promise<boolean> => {
    const dbMateri = {
        judul: materi.judul,
        nama_penulis: materi.namaPenulis,
        tanggal_terbit: materi.tanggalTerbit,
        cover_link: materi.coverLink,
        draf_link: materi.drafLink
    };
    const { error } = await supabase.from('materi_dakwah').update(dbMateri as any).eq('id', materi.id);
    return !error;
};

export const deleteMateriDakwah = async (id: number): Promise<boolean> => {
    const { error } = await supabase.from('materi_dakwah').delete().eq('id', id);
    return !error;
};

// --- Khutbah Jumat ---
export const fetchKhutbahJumat = async (): Promise<KhutbahJumat[]> => {
    const { data, error } = await supabase.from('khutbah_jumat').select('*');
    if (error) return [];
    return (data as any[]).map(k => ({
        id: k.id,
        judul: k.judul,
        namaPenulis: k.nama_penulis,
        tanggalTerbit: k.tanggal_terbit,
        coverLink: k.cover_link,
        drafLink: k.draf_link
    }));
};

export const addKhutbahJumat = async (khutbah: Omit<KhutbahJumat, 'id'>): Promise<KhutbahJumat | null> => {
    const dbKhutbah = {
        judul: khutbah.judul,
        nama_penulis: khutbah.namaPenulis,
        tanggal_terbit: khutbah.tanggalTerbit,
        cover_link: khutbah.coverLink,
        draf_link: khutbah.drafLink
    };
    const { data, error } = await supabase.from('khutbah_jumat').insert(dbKhutbah as any).select().single();
    if (error) return null;
    const d = data as any;
    return {
        id: d.id,
        judul: d.judul,
        namaPenulis: d.nama_penulis,
        tanggalTerbit: d.tanggal_terbit,
        coverLink: d.cover_link,
        drafLink: d.draf_link
    };
};

export const updateKhutbahJumat = async (khutbah: KhutbahJumat): Promise<boolean> => {
    const dbKhutbah = {
        judul: khutbah.judul,
        nama_penulis: khutbah.namaPenulis,
        tanggal_terbit: khutbah.tanggalTerbit,
        cover_link: khutbah.coverLink,
        draf_link: khutbah.drafLink
    };
    const { error } = await supabase.from('khutbah_jumat').update(dbKhutbah as any).eq('id', khutbah.id);
    return !error;
};

export const deleteKhutbahJumat = async (id: number): Promise<boolean> => {
    const { error } = await supabase.from('khutbah_jumat').delete().eq('id', id);
    return !error;
};

// --- Information ---
export const fetchInformation = async (): Promise<Information[]> => {
    const { data, error } = await supabase.from('information').select('*');
    if (error) return [];
    return (data as any[]).map(i => ({
        id: i.id,
        judul: i.judul,
        tanggal: i.tanggal,
        isi: i.isi
    }));
};

export const addInformation = async (info: Omit<Information, 'id'>): Promise<Information | null> => {
    const dbInfo = {
        judul: info.judul,
        tanggal: info.tanggal,
        isi: info.isi
    };
    const { data, error } = await supabase.from('information').insert(dbInfo as any).select().single();
    if (error) return null;
    const d = data as any;
    return {
        id: d.id,
        judul: d.judul,
        tanggal: d.tanggal,
        isi: d.isi
    };
};

export const updateInformation = async (info: Information): Promise<boolean> => {
    const dbInfo = {
        judul: info.judul,
        tanggal: info.tanggal,
        isi: info.isi
    };
    const { error } = await supabase.from('information').update(dbInfo as any).eq('id', info.id);
    return !error;
};

export const deleteInformation = async (id: number): Promise<boolean> => {
    const { error } = await supabase.from('information').delete().eq('id', id);
    return !error;
};

// --- Settings ---
export const fetchSettings = async (): Promise<Settings> => {
    const { data, error } = await supabase.from('settings').select('*').single();
    if (error || !data) {
        return {
            libraryName: 'PERPUSTAKAAN DIGITAL IAI PERSIS GARUT',
            adminPassword: 'password',
            loginLogo: '',
            adminPhoto: ''
        };
    }
    const d = data as any;
    return {
        libraryName: d.library_name,
        adminPassword: d.admin_password,
        loginLogo: d.login_logo || '',
        adminPhoto: d.admin_photo || ''
    };
};

export const updateSettings = async (settings: Settings): Promise<boolean> => {
    const dbSettings = {
        id: 1, // Singleton
        library_name: settings.libraryName,
        admin_password: settings.adminPassword,
        login_logo: settings.loginLogo,
        admin_photo: settings.adminPhoto
    };
    const { error } = await supabase.from('settings').upsert(dbSettings as any);
    return !error;
};

// --- Notifications ---
export const fetchNotifications = async (): Promise<Notification[]> => {
    const { data, error } = await supabase.from('notifications').select('*').order('created_at', { ascending: false });
    if (error) return [];
    return (data as any[]).map(n => ({
        id: n.id,
        type: n.type as any,
        title: n.title,
        message: n.message,
        timestamp: new Date(n.created_at),
        isRead: n.is_read
    }));
};

export const addNotification = async (notification: Omit<Notification, 'id'>): Promise<void> => {
    const dbNotification = {
        type: notification.type,
        title: notification.title,
        message: notification.message,
        is_read: notification.isRead
    };
    await supabase.from('notifications').insert(dbNotification as any);
};

export const markNotificationAsRead = async (id: number): Promise<void> => {
    await supabase.from('notifications').update({ is_read: true } as any).eq('id', id);
};