export interface IAuthUser {
    username: string;
    firstName: string;
    lastName: string;
    bio: string;
    phoneNumber: string;
    role: 'USER' | 'RESEARCHER' | 'ADMIN'
}

export interface LoginData { 
    email: string;
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
