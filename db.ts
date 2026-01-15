// --- Playlist ---
export const fetchPlaylist = async (): Promise<PlaylistItem[]> => {
    if (!supabase) {
        return getLocalData<PlaylistItem>(LOCAL_STORAGE_KEYS.PLAYLIST).sort((a, b) => a.order - b.order);
    }
    const { data, error } = await supabase.from('playlist_items').select('*').order('order', { ascending: true });
    if (error) return [];
    return (data as any[] || []).map(item => ({
        id: item.id,
        title: item.title,
        youtubeLink: item.youtube_link,
        order: item.order,
        isActive: item.is_active
    }));
};

export const addPlaylistItem = async (item: Omit<PlaylistItem, 'id'>): Promise<PlaylistItem | null> => {
    if (!supabase) {
        const items = getLocalData<PlaylistItem>(LOCAL_STORAGE_KEYS.PLAYLIST);
        const newItem = {
            ...item,
            id: generateId()
        } as PlaylistItem;
        // Auto-increment order if not specified
        if (!newItem.order) {
            newItem.order = items.length > 0 ? Math.max(...items.map(i => i.order)) + 1 : 1;
        }
        items.push(newItem);
        setLocalData(LOCAL_STORAGE_KEYS.PLAYLIST, items);
        return newItem;
    }
    const { data, error } = await supabase.from('playlist_items').insert({
        title: item.title,
        youtube_link: item.youtubeLink,
        order: item.order,
        is_active: item.isActive
    } as any).select().single();
    if (error || !data) return null;
    const d = data as any;
    return {
        id: d.id,
        title: d.title,
        youtubeLink: d.youtube_link,
        order: d.order,
        isActive: d.is_active
    };
};

export const updatePlaylistItem = async (item: PlaylistItem): Promise<boolean> => {
    if (!supabase) {
        const items = getLocalData<PlaylistItem>(LOCAL_STORAGE_KEYS.PLAYLIST);
        const index = items.findIndex(i => i.id === item.id);
        if (index !== -1) {
            items[index] = item;
            setLocalData(LOCAL_STORAGE_KEYS.PLAYLIST, items);
            return true;
        }
        return false;
    }
    // @ts-expect-error - Supabase type inference on updates
    const { error } = await supabase.from('playlist_items').update({
        title: item.title,
        youtube_link: item.youtubeLink,
        order: item.order,
        is_active: item.isActive
    } as any).eq('id', item.id);
    return !error;
};

export const deletePlaylistItem = async (id: number): Promise<boolean> => {
    if (!supabase) {
        const items = getLocalData<PlaylistItem>(LOCAL_STORAGE_KEYS.PLAYLIST);
        const filtered = items.filter(i => i.id !== id);
        setLocalData(LOCAL_STORAGE_KEYS.PLAYLIST, filtered);
        return true;
    }
    const { error } = await supabase.from('playlist_items').delete().eq('id', id);
    return !error;
};

import { supabase } from './lib/supabase';

// --- Local Storage Helpers ---
const LOCAL_STORAGE_KEYS = {
    USERS: 'literasi_users',
    BULLETINS: 'literasi_bulletins',
    RADIO_STREAM: 'literasi_radio_stream',
    CHAT_MESSAGES: 'literasi_chat_messages',
    WRITTEN_WORKS: 'literasi_written_works',
    GENERAL_BOOKS: 'literasi_general_books',
    KARYA_ASATIDZ: 'literasi_karya_asatidz',
    MATERI_DAKWAH: 'literasi_materi_dakwah',
    KHUTBAH_JUMAT: 'literasi_khutbah_jumat',
    INFORMATION: 'literasi_information',
    SETTINGS: 'literasi_settings',
    NOTIFICATIONS: 'literasi_notifications',
    BANNERS: 'literasi_banners',
    ARTICLES: 'literasi_articles',
    PLAYLIST: 'literasi_playlist'
};

const getLocalData = <T>(key: string): T[] => {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : [];
};

const setLocalData = <T>(key: string, data: T[]) => {
    localStorage.setItem(key, JSON.stringify(data));
};

const getLocalItem = <T>(key: string): T | null => {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : null;
};

const setLocalItem = <T>(key: string, data: T) => {
    localStorage.setItem(key, JSON.stringify(data));
};

const generateId = () => Date.now() + Math.floor(Math.random() * 1000);


// --- Users ---
export const fetchUsers = async (): Promise<User[]> => {
    if (!supabase) {
        return getLocalData<User>(LOCAL_STORAGE_KEYS.USERS);
    }

    const { data, error } = await supabase
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
    if (!supabase) {
        const users = getLocalData<User>(LOCAL_STORAGE_KEYS.USERS);
        const newUser: User = { ...user, id: generateId() } as User;
        users.push(newUser);
        setLocalData(LOCAL_STORAGE_KEYS.USERS, users);
        return newUser;
    }

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

    const { data, error } = await supabase
        .from('users')
        .insert(dbUser as any)
        .select()
        .single();

    if (error) {
        console.error('Error adding user:', error);
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
    if (!supabase) {
        const users = getLocalData<User>(LOCAL_STORAGE_KEYS.USERS);
        const index = users.findIndex(u => u.id === user.id);
        if (index !== -1) {
            users[index] = user;
            setLocalData(LOCAL_STORAGE_KEYS.USERS, users);
            return true;
        }
        return false;
    }

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
        // @ts-expect-error - Supabase update type inference issue with mapped types
        .update(dbUser as any)
        .eq('id', user.id);

    return !error;
};

export const deleteUser = async (id: number): Promise<boolean> => {
    if (!supabase) {
        const users = getLocalData<User>(LOCAL_STORAGE_KEYS.USERS);
        const filtered = users.filter(u => u.id !== id);
        if (filtered.length !== users.length) {
            setLocalData(LOCAL_STORAGE_KEYS.USERS, filtered);
            return true;
        }
        return false;
    }

    const { error } = await supabase.from('users').delete().eq('id', id);
    return !error;
};

// --- Bulletins ---
export const fetchBulletins = async (): Promise<Bulletin[]> => {
    if (!supabase) {
        return getLocalData<Bulletin>(LOCAL_STORAGE_KEYS.BULLETINS);
    }

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
    if (!supabase) {
        const items = getLocalData<Bulletin>(LOCAL_STORAGE_KEYS.BULLETINS);
        const newItem = { ...bulletin, id: generateId() };
        items.push(newItem);
        setLocalData(LOCAL_STORAGE_KEYS.BULLETINS, items);
        return newItem;
    }

    const dbBulletin = {
        judul: bulletin.judul,
        cover_link: bulletin.coverLink,
        draf_link: bulletin.drafLink,
        nama_penulis: bulletin.namaPenulis,
        tanggal_terbit: bulletin.tanggalTerbit,
        content: bulletin.content
    };
    const { data, error } = await supabase.from('bulletins').insert(dbBulletin as any).select().single();
    if (error) return null;
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
    if (!supabase) {
        const items = getLocalData<Bulletin>(LOCAL_STORAGE_KEYS.BULLETINS);
        const index = items.findIndex(i => i.id === bulletin.id);
        if (index !== -1) {
            items[index] = bulletin;
            setLocalData(LOCAL_STORAGE_KEYS.BULLETINS, items);
            return true;
        }
        return false;
    }

    const dbBulletin = {
        judul: bulletin.judul,
        cover_link: bulletin.coverLink,
        draf_link: bulletin.drafLink,
        nama_penulis: bulletin.namaPenulis,
        tanggal_terbit: bulletin.tanggalTerbit,
        content: bulletin.content
    };
    // @ts-expect-error - Supabase update type inference issue with mapped types
    const { error } = await supabase.from('bulletins').update(dbBulletin as any).eq('id', bulletin.id);
    return !error;
};

export const deleteBulletin = async (id: number): Promise<boolean> => {
    if (!supabase) {
        const items = getLocalData<Bulletin>(LOCAL_STORAGE_KEYS.BULLETINS);
        const filtered = items.filter(i => i.id !== id);
        setLocalData(LOCAL_STORAGE_KEYS.BULLETINS, filtered);
        return true;
    }

    const { error } = await supabase.from('bulletins').delete().eq('id', id);
    return !error;
};

// --- Radio Stream ---
export const fetchRadioStreamData = async (): Promise<RadioStreamData> => {
    if (!supabase) {
        const stored = getLocalItem<RadioStreamData>(LOCAL_STORAGE_KEYS.RADIO_STREAM);
        return stored || {
            title: 'Radio Stream',
            youtubeLink: '',
            whatsappLink: '',
            isPublished: false,
            messages: []
        };
    }

    const { data, error } = await supabase.from('radio_stream_data').select('*').single();

    if (error || !data) {
        return {
            title: 'Radio Stream',
            youtubeLink: '',
            whatsappLink: '',
            isPublished: false,
            messages: []
        };
    }

    const d = data as any;

    const { data: msgData } = await supabase
        .from('chat_messages')
        .select('*')
        .gt('created_at', d.updated_at || new Date(0).toISOString())
        .order('created_at', { ascending: true });

    const currentMessages = (msgData as any[] || []).map(m => ({
        id: m.id,
        sender: m.sender,
        message: m.message,
        isAdmin: m.is_admin,
        timestamp: new Date(m.created_at)
    }));

    return {
        id: d.id,
        title: d.title,
        youtubeLink: d.youtube_link,
        whatsappLink: d.whatsapp_link,
        isPublished: d.is_published,
        updatedAt: d.updated_at,
        messages: currentMessages
    };
};

export const updateRadioStreamData = async (data: Partial<RadioStreamData>): Promise<boolean> => {
    if (!supabase) {
        const current = await fetchRadioStreamData();
        const updated = { ...current, ...data };

        // If isPublished toggled to true, clear old messages implicitly by timestamp in real DB, 
        // but for local we might just clear the message array if that's the desired behavior.
        // However, the component relies on messages being in the object.
        if (data.isPublished === true && current.isPublished === false) {
            // New session
            updated.updatedAt = new Date().toISOString();
        }

        setLocalItem(LOCAL_STORAGE_KEYS.RADIO_STREAM, updated);
        return true;
    }

    const dbData: any = {};
    if (data.title !== undefined) dbData.title = data.title;
    if (data.youtubeLink !== undefined) dbData.youtube_link = data.youtubeLink;
    if (data.whatsappLink !== undefined) dbData.whatsapp_link = data.whatsappLink;
    if (data.isPublished !== undefined) dbData.is_published = data.isPublished;

    const targetId = data.id || 1;
    dbData.id = targetId;

    const { error } = await supabase
        .from('radio_stream_data')
        .upsert(dbData);
    return !error;
};

// --- Chat ---
export const fetchChatMessages = async (): Promise<ChatMessage[]> => {
    if (!supabase) {
        const streamData = await fetchRadioStreamData();
        return streamData.messages || [];
    }

    const { data, error } = await supabase
        .from('chat_messages')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);

    if (error) return [];

    return (data as any[] || []).reverse().map(m => ({
        id: m.id,
        sender: m.sender,
        message: m.message,
        isAdmin: m.is_admin,
        timestamp: new Date(m.created_at)
    }));
};

export const sendChatMessage = async (message: Omit<ChatMessage, 'id' | 'timestamp'>): Promise<ChatMessage | null> => {
    if (!supabase) {
        const streamData = await fetchRadioStreamData();
        const newMessage: ChatMessage = {
            ...message,
            id: generateId(),
            timestamp: new Date()
        };
        const updatedStream = {
            ...streamData,
            messages: [...streamData.messages, newMessage]
        };
        setLocalItem(LOCAL_STORAGE_KEYS.RADIO_STREAM, updatedStream);
        return newMessage;
    }

    const dbMessage = {
        sender: message.sender,
        message: message.message,
        is_admin: message.isAdmin
    };
    const { data, error } = await supabase
        .from('chat_messages')
        .insert(dbMessage as any)
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
    if (!supabase) {
        const streamData = await fetchRadioStreamData();
        streamData.messages = [];
        setLocalItem(LOCAL_STORAGE_KEYS.RADIO_STREAM, streamData);
        return true;
    }

    const { error } = await supabase
        .from('chat_messages')
        .delete()
        .eq('is_radio_message', true);
    return !error;
};

// --- Generic Helper for Standard Modules ---
const createModuleHelpers = <T extends { id: number }, TRaw>(
    tableName: string,
    storageKey: string,
    mapper: (raw: TRaw) => T,
    reverseMapper: (item: Omit<T, 'id'>) => any
) => {
    return {
        fetch: async (): Promise<T[]> => {
            if (!supabase) return getLocalData<T>(storageKey);
            const { data, error } = await supabase.from(tableName).select('*');
            if (error) return [];
            return (data as any[]).map(mapper);
        },
        add: async (item: Omit<T, 'id'>): Promise<T | null> => {
            if (!supabase) {
                const items = getLocalData<T>(storageKey);
                const newItem = { ...item, id: generateId() } as T;
                items.push(newItem);
                setLocalData(storageKey, items);
                return newItem;
            }
            const dbItem = reverseMapper(item);
            const { data, error } = await supabase.from(tableName).insert(dbItem).select().single();
            if (error) return null;
            return mapper(data as unknown as TRaw);
        },
        update: async (item: T): Promise<boolean> => {
            if (!supabase) {
                const items = getLocalData<T>(storageKey);
                const idx = items.findIndex(i => i.id === item.id);
                if (idx !== -1) {
                    items[idx] = item;
                    setLocalData(storageKey, items);
                    return true;
                }
                return false;
            }
            const dbItem = reverseMapper(item);
            // @ts-expect-error - Supabase update type inference issue with generic table names
            const { error } = await supabase.from(tableName).update(dbItem).eq('id', item.id);
            return !error;
        },
        delete: async (id: number): Promise<boolean> => {
            if (!supabase) {
                const items = getLocalData<T>(storageKey);
                const filtered = items.filter(i => i.id !== id);
                setLocalData(storageKey, filtered);
                return true;
            }
            const { error } = await supabase.from(tableName).delete().eq('id', id);
            return !error;
        }
    };
};

// --- Written Works ---
const mw = createModuleHelpers<WrittenWork, any>(
    'written_works',
    LOCAL_STORAGE_KEYS.WRITTEN_WORKS,
    w => ({ id: w.id, judul: w.judul, namaPenulis: w.nama_penulis, tanggalTerbit: w.tanggal_terbit, coverLink: w.cover_link, drafLink: w.draf_link, content: w.content }),
    w => ({ judul: w.judul, nama_penulis: w.namaPenulis, tanggal_terbit: w.tanggalTerbit, cover_link: w.coverLink, draf_link: w.drafLink, content: w.content })
);
export const fetchWrittenWorks = mw.fetch;
export const addWrittenWork = mw.add;
export const updateWrittenWork = mw.update;
export const deleteWrittenWork = mw.delete;

// --- General Books ---
const mgb = createModuleHelpers<GeneralBook, any>(
    'general_books',
    LOCAL_STORAGE_KEYS.GENERAL_BOOKS,
    b => ({ id: b.id, judul: b.judul, namaPenulis: b.nama_penulis, tanggalTerbit: b.tanggal_terbit, coverLink: b.cover_link, drafLink: b.draf_link }),
    b => ({ judul: b.judul, nama_penulis: b.namaPenulis, tanggal_terbit: b.tanggalTerbit, cover_link: b.coverLink, draf_link: b.drafLink })
);
export const fetchGeneralBooks = mgb.fetch;
export const addGeneralBook = mgb.add;
export const updateGeneralBook = mgb.update;
export const deleteGeneralBook = mgb.delete;

// --- Karya Asatidz ---
const mka = createModuleHelpers<KaryaAsatidz, any>(
    'karya_asatidz',
    LOCAL_STORAGE_KEYS.KARYA_ASATIDZ,
    k => ({ id: k.id, judul: k.judul, namaPenulis: k.nama_penulis, tanggalTerbit: k.tanggal_terbit, coverLink: k.cover_link, drafLink: k.draf_link }),
    k => ({ judul: k.judul, nama_penulis: k.namaPenulis, tanggal_terbit: k.tanggalTerbit, cover_link: k.coverLink, draf_link: k.drafLink })
);
export const fetchKaryaAsatidz = mka.fetch;
import type { User, RadioStreamData, Information, ChatThread, Bulletin, WrittenWork, GeneralBook, KaryaAsatidz, MateriDakwah, KhutbahJumat, Settings, Notification, ChatMessage, Banner, Article, PlaylistItem } from './types';

// --- Materi Dakwah ---
const mmd = createModuleHelpers<MateriDakwah, any>(
    'materi_dakwah',
    LOCAL_STORAGE_KEYS.MATERI_DAKWAH,
    m => ({ id: m.id, judul: m.judul, namaPenulis: m.nama_penulis, tanggalTerbit: m.tanggal_terbit, coverLink: m.cover_link, drafLink: m.draf_link }),
    m => ({ judul: m.judul, nama_penulis: m.namaPenulis, tanggal_terbit: m.tanggalTerbit, cover_link: m.coverLink, draf_link: m.drafLink })
);
export const fetchMateriDakwah = mmd.fetch;
export const addMateriDakwah = mmd.add;
export const updateMateriDakwah = mmd.update;
export const deleteMateriDakwah = mmd.delete;

// --- Khutbah Jumat ---
const mkj = createModuleHelpers<KhutbahJumat, any>(
    'khutbah_jumat',
    LOCAL_STORAGE_KEYS.KHUTBAH_JUMAT,
    k => ({ id: k.id, judul: k.judul, namaPenulis: k.nama_penulis, tanggalTerbit: k.tanggal_terbit, coverLink: k.cover_link, drafLink: k.draf_link }),
    k => ({ judul: k.judul, nama_penulis: k.namaPenulis, tanggal_terbit: k.tanggalTerbit, cover_link: k.coverLink, draf_link: k.drafLink })
);
export const fetchKhutbahJumat = mkj.fetch;
export const addKhutbahJumat = mkj.add;
export const updateKhutbahJumat = mkj.update;
export const deleteKhutbahJumat = mkj.delete;

// --- Information ---
const minf = createModuleHelpers<Information, any>(
    'information',
    LOCAL_STORAGE_KEYS.INFORMATION,
    i => ({ id: i.id, judul: i.judul, tanggal: i.tanggal, isi: i.isi }),
    i => ({ judul: i.judul, tanggal: i.tanggal, isi: i.isi })
);
export const fetchInformation = minf.fetch;
export const addInformation = minf.add;
export const updateInformation = minf.update;
export const deleteInformation = minf.delete;

// --- Settings ---
export const fetchSettings = async (): Promise<Settings> => {
    if (!supabase) {
        const stored = getLocalItem<Settings>(LOCAL_STORAGE_KEYS.SETTINGS);
        return stored || {
            libraryName: 'PERPUSTAKAAN DIGITAL PPI 19 GARUT',
            adminPassword: 'ppi19adm',
            loginLogo: '',
            adminPhoto: ''
        };
    }

    const { data, error } = await supabase.from('settings').select('*').single();
    if (error || !data) {
        return {
            libraryName: 'PERPUSTAKAAN DIGITAL PPI 19 GARUT',
            adminPassword: 'ppi19adm',
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
    if (!supabase) {
        setLocalItem(LOCAL_STORAGE_KEYS.SETTINGS, settings);
        return true;
    }

    const dbSettings = {
        id: 1,
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
    if (!supabase) {
        return getLocalData<Notification>(LOCAL_STORAGE_KEYS.NOTIFICATIONS);
    }

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
    if (!supabase) {
        const notifications = getLocalData<Notification>(LOCAL_STORAGE_KEYS.NOTIFICATIONS);
        const newNotif = {
            ...notification,
            id: generateId()
        } as Notification;
        notifications.unshift(newNotif); // Add to beginning
        setLocalData(LOCAL_STORAGE_KEYS.NOTIFICATIONS, notifications);
        return;
    }

    const dbNotification = {
        type: notification.type,
        title: notification.title,
        message: notification.message,
        is_read: notification.isRead
    };
    await supabase.from('notifications').insert(dbNotification as any);
};

export const markNotificationAsRead = async (id: number): Promise<void> => {
    if (!supabase) {
        const notifications = getLocalData<Notification>(LOCAL_STORAGE_KEYS.NOTIFICATIONS);
        const notification = notifications.find(n => n.id === id);
        if (notification) {
            notification.isRead = true;
            setLocalData(LOCAL_STORAGE_KEYS.NOTIFICATIONS, notifications);
        }
        return;
    }
    // @ts-expect-error - Supabase update type inference issue
    await supabase.from('notifications').update({ is_read: true } as any).eq('id', id);
};

export const markAllNotificationsAsRead = async (): Promise<void> => {
    if (!supabase) {
        const notifications = getLocalData<Notification>(LOCAL_STORAGE_KEYS.NOTIFICATIONS);
        notifications.forEach(n => n.isRead = true);
        setLocalData(LOCAL_STORAGE_KEYS.NOTIFICATIONS, notifications);
        return;
    }
    // @ts-expect-error - Supabase update type inference issue
    await supabase.from('notifications').update({ is_read: true } as any).eq('is_read', false);
};

// --- Banners ---
export const fetchBanners = async (): Promise<Banner[]> => {
    if (!supabase) {
        const banners = getLocalData<Banner>(LOCAL_STORAGE_KEYS.BANNERS);
        return banners
            .filter(b => b.isActive)
            .sort((a, b) => a.urutan - b.urutan);
    }

    const { data, error } = await supabase.from('banners').select('*').eq('is_active', true).order('urutan', { ascending: true });
    if (error) {
        console.error('Error fetching banners:', error);
        return [];
    }
    return (data as any[] || []).map(b => ({
        id: b.id,
        judul: b.judul,
        imageUrl: b.image_url,
        linkUrl: b.link_url,
        urutan: b.urutan,
        isActive: b.is_active
    }));
};

export const fetchAllBanners = async (): Promise<Banner[]> => {
    if (!supabase) {
        const banners = getLocalData<Banner>(LOCAL_STORAGE_KEYS.BANNERS);
        return banners.sort((a, b) => a.urutan - b.urutan);
    }

    const { data, error } = await supabase.from('banners').select('*').order('urutan', { ascending: true });
    if (error) {
        console.error('Error fetching banners:', error);
        return [];
    }
    return (data as any[] || []).map(b => ({
        id: b.id,
        judul: b.judul,
        imageUrl: b.image_url,
        linkUrl: b.link_url,
        urutan: b.urutan,
        isActive: b.is_active
    }));
};

export const addBanner = async (banner: Omit<Banner, 'id'>): Promise<Banner | null> => {
    if (!supabase) {
        const banners = getLocalData<Banner>(LOCAL_STORAGE_KEYS.BANNERS);
        const newBanner = { ...banner, id: generateId() } as Banner;
        banners.push(newBanner);
        setLocalData(LOCAL_STORAGE_KEYS.BANNERS, banners);
        return newBanner;
    }

    const dbBanner = {
        judul: banner.judul,
        image_url: banner.imageUrl,
        link_url: banner.linkUrl || null,
        urutan: banner.urutan,
        is_active: banner.isActive
    };
    const { data, error } = await supabase.from('banners').insert(dbBanner as any).select().single();
    if (error) {
        console.error('Error adding banner:', error);
        return null;
    }
    const b = data as any;
    return {
        id: b.id,
        judul: b.judul,
        imageUrl: b.image_url,
        linkUrl: b.link_url,
        urutan: b.urutan,
        isActive: b.is_active
    };
};

export const updateBanner = async (banner: Banner): Promise<boolean> => {
    if (!supabase) {
        const banners = getLocalData<Banner>(LOCAL_STORAGE_KEYS.BANNERS);
        const index = banners.findIndex(b => b.id === banner.id);
        if (index !== -1) {
            banners[index] = banner;
            setLocalData(LOCAL_STORAGE_KEYS.BANNERS, banners);
            return true;
        }
        return false;
    }

    const dbBanner = {
        judul: banner.judul,
        image_url: banner.imageUrl,
        link_url: banner.linkUrl || null,
        urutan: banner.urutan,
        is_active: banner.isActive
    };
    // @ts-expect-error - Supabase update type inference issue with mapped types
    const { error } = await supabase.from('banners').update(dbBanner as any).eq('id', banner.id);
    return !error;
};

export const deleteBanner = async (id: number): Promise<boolean> => {
    if (!supabase) {
        const banners = getLocalData<Banner>(LOCAL_STORAGE_KEYS.BANNERS);
        const filtered = banners.filter(b => b.id !== id);
        setLocalData(LOCAL_STORAGE_KEYS.BANNERS, filtered);
        return true;
    }

    const { error } = await supabase.from('banners').delete().eq('id', id);
    return !error;
};

// --- Articles ---
export const fetchArticles = async (): Promise<Article[]> => {
    if (!supabase) {
        return getLocalData<Article>(LOCAL_STORAGE_KEYS.ARTICLES);
    }

    const { data, error } = await supabase.from('articles').select('*').order('tanggal_terbit', { ascending: false });
    if (error) {
        console.error('Error fetching articles:', error);
        return [];
    }
    return (data as any[] || []).map(a => ({
        id: a.id,
        judul: a.judul,
        konten: a.konten,
        tanggalTerbit: a.tanggal_terbit,
        imageUrl: a.image_url
    }));
};

export const addArticle = async (article: Omit<Article, 'id'>): Promise<Article | null> => {
    if (!supabase) {
        const articles = getLocalData<Article>(LOCAL_STORAGE_KEYS.ARTICLES);
        const newArticle = { ...article, id: generateId() } as Article;
        articles.push(newArticle);
        setLocalData(LOCAL_STORAGE_KEYS.ARTICLES, articles);
        return newArticle;
    }

    const dbArticle = {
        judul: article.judul,
        konten: article.konten || null,
        tanggal_terbit: article.tanggalTerbit,
        image_url: article.imageUrl || null
    };
    const { data, error } = await supabase.from('articles').insert(dbArticle as any).select().single();
    if (error) {
        console.error('Error adding article:', error);
        return null;
    }
    const a = data as any;
    return {
        id: a.id,
        judul: a.judul,
        konten: a.konten,
        tanggalTerbit: a.tanggal_terbit,
        imageUrl: a.image_url
    };
};

export const updateArticle = async (article: Article): Promise<boolean> => {
    if (!supabase) {
        const articles = getLocalData<Article>(LOCAL_STORAGE_KEYS.ARTICLES);
        const index = articles.findIndex(a => a.id === article.id);
        if (index !== -1) {
            articles[index] = article;
            setLocalData(LOCAL_STORAGE_KEYS.ARTICLES, articles);
            return true;
        }
        return false;
    }

    const dbArticle = {
        judul: article.judul,
        konten: article.konten || null,
        tanggal_terbit: article.tanggalTerbit,
        image_url: article.imageUrl || null
    };
    // @ts-expect-error - Supabase update type inference issue with mapped types
    const { error } = await supabase.from('articles').update(dbArticle as any).eq('id', article.id);
    return !error;
};

export const deleteArticle = async (id: number): Promise<boolean> => {
    if (!supabase) {
        const articles = getLocalData<Article>(LOCAL_STORAGE_KEYS.ARTICLES);
        const filtered = articles.filter(a => a.id !== id);
        setLocalData(LOCAL_STORAGE_KEYS.ARTICLES, filtered);
        return true;
    }

    const { error } = await supabase.from('articles').delete().eq('id', id);
    return !error;
};