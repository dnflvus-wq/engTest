import { useState, useEffect, useCallback } from 'react';
import api from '../utils/api';

export function useFetch(endpoint, options = {}) {
    const { enabled = true } = options;
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const refetch = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const result = await api.get(endpoint);
            setData(result);
            return result;
        } catch (err) {
            setError(err);
        } finally {
            setLoading(false);
        }
    }, [endpoint]);

    useEffect(() => {
        if (enabled) {
            refetch();
        }
    }, [enabled, refetch]);

    return { data, loading, error, refetch, setData };
}
