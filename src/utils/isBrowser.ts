const isBrowser = () => {
    return typeof window !== 'undefined' ? true : false
}

export default isBrowser