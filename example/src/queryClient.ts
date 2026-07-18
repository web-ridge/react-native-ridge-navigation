import { QueryClient } from '@tanstack/react-query';

// react-query v5 removed the global `suspense` option; screens now use
// useSuspenseQuery explicitly.
const queryClient = new QueryClient();

export default queryClient;
