import converter from 'bunsen-core/lib/conversion/view-v1-to-v2'

export function convert (bv1View, outfile, logger) {
  const results = converter(bv1View)
  if (results) {
    return Promise.resolve(results)
  }
  return Promise.reject(results)
}
