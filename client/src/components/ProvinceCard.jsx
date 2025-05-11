import React from 'react';
import { Card, CardContent, Typography, Box } from '@mui/material';
import { FaUsers, FaGraduationCap, FaChartBar } from 'react-icons/fa';

const ProvinceCard = ({ province, stats }) => {
    return (
        <Card sx={{ 
            width: '100%',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            p: 2,
            mb: 2
        }}>
            <CardContent>
                <Typography variant="h6" component="div" gutterBottom>
                    {province.nom}
                </Typography>
                
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                    <Box>
                        <Typography variant="body2" color="text.secondary">
                            Nombre d'établissements
                        </Typography>
                        <Typography variant="h5" component="div">
                            <FaGraduationCap style={{ marginRight: 8 }} />
                            {stats.etablissements}
                        </Typography>
                    </Box>
                    
                    <Box>
                        <Typography variant="body2" color="text.secondary">
                            Nombre d'élèves
                        </Typography>
                        <Typography variant="h5" component="div">
                            <FaUsers style={{ marginRight: 8 }} />
                            {stats.eleves}
                        </Typography>
                    </Box>
                </Box>

                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Box>
                        <Typography variant="body2" color="text.secondary">
                            Taux de réussite
                        </Typography>
                        <Typography variant="h5" component="div">
                            <FaChartBar style={{ marginRight: 8 }} />
                            {stats.taux_reussite}%
                        </Typography>
                    </Box>
                </Box>
            </CardContent>
        </Card>
    );
};

export default ProvinceCard;
