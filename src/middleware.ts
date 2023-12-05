import { RequestMiddleware, Variables, resolveRequestDocument } from 'graphql-request'
import { type TypedDocumentNode } from '@graphql-typed-document-node/core'
import { getFilesKeysAndPayload, getNestedValue, hasBlobValue } from './utils'

function buildFormData<Result, V extends Variables> (
    document: TypedDocumentNode<Result, V>,
    variables: V,
): FormData {
    const formData = new FormData()
    const [filesKeys, finalVariables] = getFilesKeysAndPayload(variables)
    formData.append(
        'operations',
        JSON.stringify({
            query: resolveRequestDocument(document).query,
            variables: finalVariables
        })
    )
    const properties: Array<[string, string]> = filesKeys
        .map((key, index) => [String(index), key])
    const finalMap = Object.fromEntries(
        properties
            .map(([index, key]) => {
                return [index, ['variables.' + key]]
            })
    )
    formData.append('map', JSON.stringify(finalMap))
    for (const [index, key] of properties) {
        const value: Blob | File = getNestedValue(variables, key) 
        let filename: string | undefined = undefined
        if (value instanceof File) filename = value.name
        formData.append(index, value, filename)
    }
    return formData
}

export const uploadMiddleware: RequestMiddleware = (request) => {
    const variables = request.variables
    if (variables === undefined) return request
    const hasFiles = hasBlobValue(variables)
    if (!hasFiles) return request
    if (request.body == null) return request
    const body = JSON.parse(request.body as any)
    const formData = buildFormData(
        body.query, variables 
    )
    request.body = formData
    request.method = 'POST'
    if (request.headers !== undefined)
        delete (request.headers as any)['Content-Type']
    return request
}
