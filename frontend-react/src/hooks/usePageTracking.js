import { useEffect } from 'react';
import api from '../utils/api';

export default function usePageTracking(action) {
    useEffect(() => {
        if (action) {
            api.post('/actions/track', { action }).catch(() => {});
        }
    }, [action]);
}
