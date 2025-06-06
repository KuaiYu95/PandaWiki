import logo from '@/assets/images/logo.png';
import { Box, Stack } from "@mui/material";
import Image from "next/image";
import Link from 'next/link';

const Footer = () => {
  return <Box sx={{
    position: 'relative',
    fontSize: '12px',
    fontWeight: 'normal',
    color: '#999',
    height: 40,
    lineHeight: '40px',
    bgcolor: '#fff',
    zIndex: 1,
  }}>
    <Stack direction={'row'} alignItems={'center'} justifyContent={'center'} gap={0.5}>
      本网站由
      <Link href={'https://pandawiki.docs.baizhi.cloud/'} target='_blank'>
        <Stack direction={'row'} alignItems={'center'} gap={0.5} sx={{
          color: '#000',
          cursor: 'pointer',
          '&:hover': {
            color: '#556AFF',
          }
        }}>
          <Image src={logo.src} alt="PandaWiki" width={16} height={16} />
          <Box sx={{ fontWeight: 'bold' }}>PandaWiki</Box>
        </Stack>
      </Link>
      提供技术支持
    </Stack>
  </Box>
}

export default Footer