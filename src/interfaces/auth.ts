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

