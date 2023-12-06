export function hasBlobValue (data: object): boolean  {
    for (const value of Object.values(data)) {
        if (typeof value !== 'object' || value === null) continue
        if (value instanceof Blob) return true
        const hasBlob = hasBlobValue(value)
        if (hasBlob) return true
    }
    return false
}

export function getFilesKeysAndPayload (
    variables: Record<string, any> | Array<any>,
    initialPath: string = ''
): [string[], Record<string, any> | Array<any>] {
    const filesKeys: string[] = []
    const newObject: any = Array.isArray(variables) ? [] : {}
    for (const [key, value] of Object.entries(variables)) {
        if (value instanceof Blob) {
            filesKeys.push(initialPath + key);
            newObject[key] = null
            continue
        }
        if (typeof value === 'object' && value !== null) {
            const [valueFilesKeys, valueObj] = getFilesKeysAndPayload(
                value, initialPath + key + '.'
            )
            filesKeys.push(...valueFilesKeys);
            newObject[key] = valueObj 
            continue
        }
        newObject[key] = value 
    }

    return [filesKeys, newObject]
}

export function getNestedValue (obj: Record<string, any>, key: string): any {
    const subkeys = key.split('.')
    while (subkeys.length > 0) {
        const key = subkeys.shift()
        if (key === undefined) throw new Error()
        obj = obj[key]
    }
    return obj
}
