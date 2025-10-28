import { ConstsCrawlerSource } from '@/request';
import { Stack, TextField } from '@mui/material';

type FormData = {
  url?: string;
  app_id?: string;
  app_secret?: string;
  user_access_token?: string;
};

interface FormInputProps {
  type: ConstsCrawlerSource;
  formData: FormData;
  onChange: (data: FormData) => void;
}

interface FieldConfig {
  label: string;
  placeholder: string;
  fieldName: keyof FormData;
  multiline?: boolean;
  rows?: number;
}

/**
 * 通用表单字段渲染器
 */
const FormFieldRenderer = ({
  fields,
  formData,
  onChange,
}: {
  fields: FieldConfig[];
  formData: FormData;
  onChange: (data: FormData) => void;
}) => (
  <>
    {fields.map((field, index) => (
      <div key={field.fieldName}>
        <Stack
          direction='row'
          alignItems='center'
          justifyContent='space-between'
          sx={{ fontSize: 14, lineHeight: '32px' }}
        >
          {field.label}
        </Stack>
        <TextField
          fullWidth
          multiline={field.multiline}
          rows={field.rows}
          value={formData[field.fieldName] || ''}
          placeholder={field.placeholder}
          autoFocus={index === 0}
          onChange={e =>
            onChange({ ...formData, [field.fieldName]: e.target.value })
          }
        />
      </div>
    ))}
  </>
);

const FormInput = ({ type, formData, onChange }: FormInputProps) => {
  // 表单配置
  const formFieldsConfig: Partial<Record<ConstsCrawlerSource, FieldConfig[]>> =
    {
      [ConstsCrawlerSource.CrawlerSourceUrl]: [
        {
          label: 'URL 地址',
          placeholder: '每行一个 URL',
          fieldName: 'url',
          multiline: true,
          rows: 20,
        },
      ],
      [ConstsCrawlerSource.CrawlerSourceRSS]: [
        {
          label: 'RSS 地址',
          placeholder: 'RSS 地址',
          fieldName: 'url',
        },
      ],
      [ConstsCrawlerSource.CrawlerSourceSitemap]: [
        {
          label: 'Sitemap 地址',
          placeholder: 'Sitemap 地址',
          fieldName: 'url',
        },
      ],
      [ConstsCrawlerSource.CrawlerSourceNotion]: [
        {
          label: 'Integration Secret',
          placeholder: 'Integration Secret',
          fieldName: 'url',
        },
      ],
      [ConstsCrawlerSource.CrawlerSourceFeishu]: [
        {
          label: 'App ID',
          placeholder: '> 飞书开放平台 > 凭证与基础信息 > 应用凭证 > App ID',
          fieldName: 'app_id',
        },
        {
          label: 'Client Secret',
          placeholder:
            '> 飞书开放平台 > 凭证与基础信息 > 应用凭证 > App Secret',
          fieldName: 'app_secret',
        },
        {
          label: 'User Access Token',
          placeholder: '',
          fieldName: 'user_access_token',
        },
      ],
    };

  const fields = formFieldsConfig[type];

  if (!fields) return null;

  return (
    <FormFieldRenderer
      fields={fields}
      formData={formData}
      onChange={onChange}
    />
  );
};

export default FormInput;
