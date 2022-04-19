import React from 'react'
export const UserContext = React.createContext({
    loading: true,
    setLoading: (loading) => {},
    mobileData: {},
    setMobileData: (mobileData) => {},
});