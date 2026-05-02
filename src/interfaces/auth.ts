export interface IAuthUser {
    id: number;
    username: string;
    email: string;
    first_name: string;
    last_name: string;
    bio: string;
    
    phone_number: string;
    role: 'USER' | 'RESEARCHER' | 'ADMIN';
    profile_picture: string;
    profile_thumbnail: string;
    researcher_profile?: {
        application_status: string;
        credentials: string;
        institute: string;
    }
}


export interface LoginData { 
    username: string;
    password: string;
}

export interface IAuthContext {
    authUser: IAuthUser | null;
    login: (data: LoginData) => Promise<void>;
    logout: () => Promise<void>;
    loading: boolean;
}

export interface RegistrationData { 
    role: 'USER' | 'RESEARCHER' | 'ADMIN'; 
    username: string;
    email: string;
    password1: string;
    password2: string;
    first_name: string;
    last_name: string;
    phone_number: string;
    institute?: string;
    credentials?: File | null;
}
