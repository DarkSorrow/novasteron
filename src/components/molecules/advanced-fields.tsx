import { Box, Button, Typography, Collapse } from "@mui/material";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';

interface AdvancedFieldsProps {
  children: React.ReactNode;
  title?: string;
  description?: string;
}

export const AdvancedFields = ({ children, title, description }: AdvancedFieldsProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const { t } = useTranslation();

  return (
    <Box>
      <Button
        onClick={() => setIsExpanded(!isExpanded)}
        endIcon={isExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
        sx={{ mb: 1 }}
      >
        {title || t('advancedSettings')}
      </Button>
      {description && (
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          {description}
        </Typography>
      )}
      <Collapse in={isExpanded}>
        {children}
      </Collapse>
    </Box>
  );
};
