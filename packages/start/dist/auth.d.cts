declare const authActions: {
    login(username: string, password: string): Promise<{
        success: true;
        token: string;
    } | {
        success: false;
        error: string;
    }>;
    logout(): Promise<{
        success: true;
    }>;
    checkAuth(): Promise<{
        authenticated: boolean;
    }>;
    loadUser(): Promise<{
        userId: number;
        username: string;
    } | null>;
    getUsers(): Promise<{
        id: number;
        username: string;
        createdAt: Date;
    }[]>;
    createUser(username: string, password: string): Promise<{
        id: number;
    }>;
    updatePassword(userId: number, newPassword: string): Promise<void>;
    deleteUser(userId: number): Promise<void>;
};

export { authActions };
