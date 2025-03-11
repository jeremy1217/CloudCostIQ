import React, { useState } from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { Box, Paper, Typography, Skeleton, useTheme } from '@mui/material';

const CHART_TYPES = {
  LINE: 'line',
  BAR: 'bar',
  AREA: 'area',
  PIE: 'pie',
};

const ANIMATIONS = {
  duration: 800,
  easing: 'ease-in-out',
};

const CustomTooltip = ({ active, payload, label, valuePrefix, valueSuffix }) => {
  if (active && payload && payload.length) {
    return (
      <Paper
        elevation={3}
        sx={{
          p: 1.5,
          backgroundColor: 'rgba(255, 255, 255, 0.96)',
          border: '1px solid',
          borderColor: 'divider',
        }}
      >
        <Typography variant="subtitle2" color="text.primary" gutterBottom>
          {label}
        </Typography>
        {payload.map((entry, index) => (
          <Box key={index} sx={{ display: 'flex', alignItems: 'center', gap: 1, my: 0.5 }}>
            <Box
              sx={{
                width: 12,
                height: 12,
                backgroundColor: entry.color,
                borderRadius: '50%',
              }}
            />
            <Typography variant="body2" color="text.secondary">
              {entry.name}:{' '}
              <Typography component="span" variant="body2" color="text.primary" fontWeight="medium">
                {valuePrefix}
                {typeof entry.value === 'number' ? entry.value.toLocaleString() : entry.value}
                {valueSuffix}
              </Typography>
            </Typography>
          </Box>
        ))}
      </Paper>
    );
  }
  return null;
};

const AnimatedChart = ({
  type = CHART_TYPES.LINE,
  data = [],
  series = [],
  loading = false,
  height = 400,
  valuePrefix = '',
  valueSuffix = '',
  title,
  subtitle,
}) => {
  const theme = useTheme();
  const [activeIndex, setActiveIndex] = useState(null);

  const chartColors = [
    theme.palette.primary.main,
    theme.palette.secondary.main,
    theme.palette.success.main,
    theme.palette.error.main,
    theme.palette.warning.main,
    theme.palette.info.main,
  ];

  if (loading) {
    return (
      <Paper elevation={0} sx={{ p: 3, height }}>
        {title && <Skeleton width={200} height={28} sx={{ mb: 1 }} />}
        {subtitle && <Skeleton width={300} height={20} sx={{ mb: 2 }} />}
        <Skeleton variant="rectangular" width="100%" height={height - 100} />
      </Paper>
    );
  }

  const renderChart = () => {
    const commonProps = {
      data,
      margin: { top: 20, right: 30, left: 20, bottom: 20 },
    };

    switch (type) {
      case CHART_TYPES.LINE:
        return (
          <LineChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} />
            <XAxis
              dataKey="name"
              stroke={theme.palette.text.secondary}
              tick={{ fill: theme.palette.text.secondary }}
            />
            <YAxis
              stroke={theme.palette.text.secondary}
              tick={{ fill: theme.palette.text.secondary }}
            />
            <Tooltip content={<CustomTooltip valuePrefix={valuePrefix} valueSuffix={valueSuffix} />} />
            <Legend />
            {series.map((item, index) => (
              <Line
                key={item.dataKey}
                type="monotone"
                dataKey={item.dataKey}
                name={item.name}
                stroke={item.color || chartColors[index % chartColors.length]}
                strokeWidth={2}
                dot={{ r: 4 }}
                activeDot={{ r: 6 }}
                animationDuration={ANIMATIONS.duration}
                animationEasing={ANIMATIONS.easing}
              />
            ))}
          </LineChart>
        );

      case CHART_TYPES.BAR:
        return (
          <BarChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} />
            <XAxis
              dataKey="name"
              stroke={theme.palette.text.secondary}
              tick={{ fill: theme.palette.text.secondary }}
            />
            <YAxis
              stroke={theme.palette.text.secondary}
              tick={{ fill: theme.palette.text.secondary }}
            />
            <Tooltip content={<CustomTooltip valuePrefix={valuePrefix} valueSuffix={valueSuffix} />} />
            <Legend />
            {series.map((item, index) => (
              <Bar
                key={item.dataKey}
                dataKey={item.dataKey}
                name={item.name}
                fill={item.color || chartColors[index % chartColors.length]}
                animationDuration={ANIMATIONS.duration}
                animationEasing={ANIMATIONS.easing}
                radius={[4, 4, 0, 0]}
              />
            ))}
          </BarChart>
        );

      case CHART_TYPES.AREA:
        return (
          <AreaChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} />
            <XAxis
              dataKey="name"
              stroke={theme.palette.text.secondary}
              tick={{ fill: theme.palette.text.secondary }}
            />
            <YAxis
              stroke={theme.palette.text.secondary}
              tick={{ fill: theme.palette.text.secondary }}
            />
            <Tooltip content={<CustomTooltip valuePrefix={valuePrefix} valueSuffix={valueSuffix} />} />
            <Legend />
            {series.map((item, index) => (
              <Area
                key={item.dataKey}
                type="monotone"
                dataKey={item.dataKey}
                name={item.name}
                fill={item.color || chartColors[index % chartColors.length]}
                stroke={item.color || chartColors[index % chartColors.length]}
                fillOpacity={0.2}
                animationDuration={ANIMATIONS.duration}
                animationEasing={ANIMATIONS.easing}
              />
            ))}
          </AreaChart>
        );

      case CHART_TYPES.PIE:
        return (
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius="60%"
              outerRadius="80%"
              paddingAngle={2}
              dataKey={series[0]?.dataKey}
              nameKey="name"
              animationDuration={ANIMATIONS.duration}
              animationEasing={ANIMATIONS.easing}
              onMouseEnter={(_, index) => setActiveIndex(index)}
              onMouseLeave={() => setActiveIndex(null)}
            >
              {data.map((entry, index) => (
                <Cell
                  key={entry.name}
                  fill={chartColors[index % chartColors.length]}
                  opacity={activeIndex === null || activeIndex === index ? 1 : 0.6}
                />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip valuePrefix={valuePrefix} valueSuffix={valueSuffix} />} />
            <Legend />
          </PieChart>
        );

      default:
        return null;
    }
  };

  return (
    <Paper elevation={0} sx={{ p: 3 }}>
      {title && (
        <Typography variant="h6" gutterBottom>
          {title}
        </Typography>
      )}
      {subtitle && (
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          {subtitle}
        </Typography>
      )}
      <Box sx={{ width: '100%', height }}>
        <ResponsiveContainer>{renderChart()}</ResponsiveContainer>
      </Box>
    </Paper>
  );
};

export default AnimatedChart; 