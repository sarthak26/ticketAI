import { useEffect, useState, type ChangeEvent } from 'react';

import { Button } from '../../components/ui/Button';
import { Card, CardContent, CardHeader } from '../../components/ui/Card';
import { Table, TableContainer, TableShell, Td, Th, Thead, Tr } from '../../components/ui/Table';
import { useToast } from '../../components/ui/ToastProvider';
import { api } from '../../services/api';
import type { KnowledgeDocument } from '../../types';

export const KnowledgeBasePage = () => {
  const [documents, setDocuments] = useState<KnowledgeDocument[]>([]);
  const [uploading, setUploading] = useState(false);
  const { showToast } = useToast();

  const fetchDocuments = async () => {
    const response = await api.getKnowledgeDocuments();
    setDocuments(response.data);
  };

  useEffect(() => {
    void fetchDocuments();
  }, []);

  const onUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }
    if (!file.name.endsWith('.md') && !file.name.endsWith('.txt')) {
      showToast('Upload only .md or .txt files', { variant: 'error' });
      return;
    }
    setUploading(true);
    try {
      await api.uploadKnowledgeDocument(file);
      await fetchDocuments();
      showToast('Document uploaded', { variant: 'success' });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Upload failed';
      showToast(message, { variant: 'error' });
    } finally {
      setUploading(false);
      event.target.value = '';
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-end justify-between">
        <div>
          <h3 className="text-2xl font-semibold tracking-tight text-slate-900">Knowledge Base</h3>
          <p className="mt-1 text-sm text-slate-500">
            Upload markdown or text files that improve AI reply quality.
          </p>
        </div>
        <label>
          <input type="file" className="hidden" onChange={onUpload} />
          <Button variant="secondary" disabled={uploading}>
            {uploading ? 'Uploading...' : 'Upload Document'}
          </Button>
        </label>
      </div>

      <Card>
        <CardHeader>
          <h4 className="text-sm font-semibold text-slate-900">Documents</h4>
        </CardHeader>
        <CardContent className="p-0">
          <TableShell>
            <TableContainer>
              <Table>
                <Thead>
                  <Tr className="hover:bg-slate-50">
                    <Th>Name</Th>
                    <Th>Source</Th>
                    <Th>Uploaded Date</Th>
                  </Tr>
                </Thead>
                <tbody>
                  {documents.map((doc) => (
                    <Tr key={doc.id}>
                      <Td>{doc.name}</Td>
                      <Td className="capitalize">{doc.source}</Td>
                      <Td>{new Date(doc.created).toLocaleString()}</Td>
                    </Tr>
                  ))}
                </tbody>
              </Table>
            </TableContainer>
          </TableShell>
        </CardContent>
      </Card>
    </div>
  );
};
