import { HTML5HistoryManager } from 'navigation';

export default function getHistoryManager(basePath: string | undefined) {
  return new HTML5HistoryManager(basePath);
}
