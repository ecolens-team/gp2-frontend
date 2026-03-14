const ErrorPage = () => {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen font-bold text-gray-600">
            <p className="text-9xl font-extrabold text-teal-600">!</p>
            <h1>Oops! Something went wrong.</h1>
            <p>
                An unexpected error has occurred. Please try refreshing the page or go back to the homepage.
            </p>
        </div>
    );
};

export default ErrorPage;