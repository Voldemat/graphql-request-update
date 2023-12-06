import { getFilesKeysAndPayload, getNestedValue } from "./utils"

describe('getNestedValue', () => {
    it('Should return first key', () => {
        const obj = { a:1 }
        const value = getNestedValue(obj, 'a')
        expect(value).toBe(1)
    })

    it('Should return nested value', () => {
        const obj = { a: { b: { c: 1} } }
        const value = getNestedValue(obj, 'a.b.c')
        expect(value).toBe(1)
    })

    it('Should return undefined if key doesn`t exists', () => {
        expect(getNestedValue({}, 'a')).toBeUndefined()
    })
})

describe('getFilesKeysAndPayload', () => {
    it('Should return filesKeys and object with filesKeys values nullified', () => {
        const variables = { a:1, b: 2, c: new File([], '') }
        const [filesKeys, obj] = getFilesKeysAndPayload(variables)
        expect(filesKeys).toEqual(['c'])
        expect(obj).toStrictEqual({ a: 1, b: 2, c: null })
    })

    it('Should replace array of files with array of nulls', () => {
        const variables = {
            files: [
                new File([], ''),
                new File([], '')
            ]
        }
        const [filesKeys, obj] = getFilesKeysAndPayload(variables)
        expect(filesKeys).toEqual(['files.0', 'files.1'])
        expect(obj).toStrictEqual({ files: [null, null]})
    })
})
