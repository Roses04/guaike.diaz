import { Helmet } from 'react-helmet-async'

const SITE_NAME = 'GUAIKE.DÍAZ'
const DEFAULT_DESCRIPTION =
  'Descubre el corazón artesanal de la Isla de Margarita. Directorio de talleres, ferias culturales y rutas turísticas en el Municipio Díaz, Nueva Esparta, Venezuela.'
const DEFAULT_IMAGE = 'https://guaike.diaz.vercel.app/images/San_Juan_Valley.jpg'
const BASE_URL = 'https://guaike.diaz.vercel.app'

interface SEOProps {
  title: string
  description?: string
  canonical?: string
  image?: string
  type?: string
}

const SEO = ({
  title,
  description = DEFAULT_DESCRIPTION,
  canonical = BASE_URL,
  image = DEFAULT_IMAGE,
  type = 'website',
}: SEOProps) => {
  const fullTitle = `${title} | ${SITE_NAME}`
  const url = canonical.startsWith('http') ? canonical : `${BASE_URL}${canonical}`

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="title" content={fullTitle} />
      <meta name="description" content={description} />
      <link rel="canonical" href={url} />

      <meta property="og:type" content={type} />
      <meta property="og:url" content={url} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:locale" content="es_ES" />
      <meta property="og:site_name" content={SITE_NAME} />

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content={url} />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />
    </Helmet>
  )
}

export default SEO
