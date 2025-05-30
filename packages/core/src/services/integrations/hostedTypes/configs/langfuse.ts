import { HostedIntegrationConfig } from '../types'
import { npxCommand } from '../utils'

const LANGFUSE_MCP_CONFIG: HostedIntegrationConfig = {
  command: npxCommand({
    package: '@modelcontextprotocol/inspector',
    args: 'node ./build/index.js',
  }),
  envSource: 'https://github.com/langfuse/langfuse-mcp',
  env: {
    LANGFUSE_PUBLIC_KEY: {
      label: 'LANGFUSE_PUBLIC_KEY',
      placeholder: 'your-public-key',
      required: true,
    },
    LANGFUSE_SECRET_KEY: {
      label: 'LANGFUSE_SECRET_KEY',
      placeholder: 'your-secret-key',
      required: true,
    },
    LANGFUSE_BASE_URL: {
      label: 'Langfuse Base URL (optional)',
      description: 'For self-hosted Langfuse instances. Leave empty to use Langfuse cloud.',
      placeholder: 'https://your-langfuse-instance.com',
      required: false,
    },
  },
}

export default LANGFUSE_MCP_CONFIG
