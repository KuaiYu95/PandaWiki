import { ChunkResultItem } from "@/assets/type";
import { IconArrowUp } from "@/components/icons";
import { StyledCard } from "@/components/StyledHTML";
import { useMobile } from "@/provider/mobile-provider";
import { Box, Skeleton, Stack } from "@mui/material";
import { Ellipsis } from "ct-mui";
import Link from "next/link";

const SearchResult = ({ list, loading }: { list: ChunkResultItem[], loading: boolean }) => {
  const { mobile = false } = useMobile()

  return <StyledCard sx={{
    p: 1.5,
    height: mobile ? 'calc(100vh - 181px)' : 'calc(100vh - 226px)',
    overflow: 'auto',
  }}>
    {list.map(item => (
      <Box key={item.node_id} sx={{
        ...(mobile && {
          borderBottom: '1px dashed',
          borderColor: 'divider',
        })
      }}>
        <Link href={`/node/${item.node_id}`} target="_blank">
          <Stack direction='row' alignItems='center' gap={3} justifyContent='space-between' sx={(theme) => ({
            borderRadius: '10px',
            px: 2,
            py: '14px',
            cursor: 'pointer',
            bgcolor: 'background.default',
            '&:hover': {
              bgcolor: 'background.paper',
              '.hover-primary': {
                color: theme.vars.palette.primary.main,
                fontWeight: '700',
              }
            }
          })}>
            <Box sx={{ width: 'calc(100% - 80px)' }}>
              <Ellipsis className='hover-primary' sx={{ lineHeight: '24px' }}>{item.name}</Ellipsis>
              <Ellipsis sx={{ fontSize: 12, color: 'text.tertiary', lineHeight: '20px' }}>{item.summary}</Ellipsis>
            </Box>
            <IconArrowUp className='hover-primary' sx={{ color: 'text.tertiary', flexShrink: 0, fontSize: 16, transform: 'rotate(90deg)' }} />
          </Stack>
        </Link>
      </Box>
    ))}
    {loading && <Box sx={{ mt: 1 }}>
      <Stack gap={1} sx={{
        borderRadius: '10px',
        px: 2,
      }}>
        <Skeleton variant="text" sx={{ width: '40%', height: '24px' }} />
        <Skeleton variant="text" sx={{ width: '100%', height: '20px' }} />
      </Stack>
    </Box>}
  </StyledCard>
};

export default SearchResult;