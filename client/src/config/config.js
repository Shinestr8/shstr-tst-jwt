const prod = {
    url: {
        backend: "/api"
    }
};

const dev = {
    url: {
        backend: "http://localhost:5000/api"
    }
};

export const config = process.env.NODE_ENV === 'development' ? dev : prod;