import React, { useCallback } from 'react';
import { FixedSizeList as List } from 'react-window';
import AutoSizer from 'react-virtualized-auto-sizer';
import { Box } from '@mui/material';
import AIRecommendationCard from './AIRecommendationCard';

const ITEM_HEIGHT = 200; // Approximate height of each recommendation card

const VirtualizedRecommendationList = ({ recommendations, onApply, isRecBeingApplied }) => {
    const renderRow = useCallback(({ index, style }) => {
        const recommendation = recommendations[index];
        return (
            <Box style={{ ...style, paddingBottom: 16 }}>
                <AIRecommendationCard
                    key={recommendation.id}
                    recommendation={recommendation}
                    onApply={onApply}
                    isApplying={isRecBeingApplied(recommendation)}
                />
            </Box>
        );
    }, [recommendations, onApply, isRecBeingApplied]);

    return (
        <Box sx={{ height: '70vh', width: '100%' }}>
            <AutoSizer>
                {({ height, width }) => (
                    <List
                        height={height}
                        itemCount={recommendations.length}
                        itemSize={ITEM_HEIGHT}
                        width={width}
                        overscanCount={3}
                    >
                        {renderRow}
                    </List>
                )}
            </AutoSizer>
        </Box>
    );
};

export default VirtualizedRecommendationList; 