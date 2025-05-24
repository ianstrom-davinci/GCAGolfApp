// File: frontend/src/components/Sessions/ShotTable.tsx
// ---------------------------------------------------
import React, { useState } from 'react';
import { DataTable, DataTableColumn } from 'mantine-datatable';
import { ActionIcon, Modal, Stack, Text, Group, Button } from '@mantine/core';
import { IconTrash } from '@tabler/icons-react';
import { ShotData } from '../../types/golf';
import { EditableCell } from '../Common/EditableCell';

interface ShotTableProps {
  shots: ShotData[];
  onUpdateShot: (shotId: number, field: string, value: number) => void;
  onDeleteShot: (shotId: number) => void;
}

export function ShotTable({ shots, onUpdateShot, onDeleteShot }: ShotTableProps) {
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [shotToDelete, setShotToDelete] = useState<number | null>(null);

  const handleDeleteConfirm = () => {
    if (shotToDelete) {
      onDeleteShot(shotToDelete);
      setDeleteConfirmOpen(false);
      setShotToDelete(null);
    }
  };

  const columns: DataTableColumn<ShotData>[] = [
    {
      accessor: 'timestamp',
      title: 'Time',
      width: 160,
      render: (shot) => shot.timestamp ? new Date(shot.timestamp).toLocaleString() : 'N/A',
    },
    {
      accessor: 'ball_speed',
      title: 'Ball Speed',
      width: 130,
      render: (shot) => (
        <EditableCell
          value={shot.ball_speed}
          onSave={(value) => onUpdateShot(shot.id!, 'ball_speed', value)}
          suffix=" mph"
        />
      ),
    },
    {
      accessor: 'club_head_speed',
      title: 'Club Speed',
      width: 130,
      render: (shot) => (
        <EditableCell
          value={shot.club_head_speed}
          onSave={(value) => onUpdateShot(shot.id!, 'club_head_speed', value)}
          suffix=" mph"
        />
      ),
    },
    {
      accessor: 'smash_factor',
      title: 'Smash',
      width: 80,
      render: (shot) => (
        <EditableCell
          value={shot.smash_factor}
          onSave={(value) => onUpdateShot(shot.id!, 'smash_factor', value)}
        />
      ),
    },
    {
      accessor: 'launch_angle',
      title: 'Launch (°)',
      width: 100,
      render: (shot) => (
        <EditableCell
          value={shot.launch_angle}
          onSave={(value) => onUpdateShot(shot.id!, 'launch_angle', value)}
          suffix="°"
        />
      ),
    },
    {
      accessor: 'apex_height',
      title: 'Apex (ft)',
      width: 100,
      render: (shot) => (
        <EditableCell
          value={shot.apex_height}
          onSave={(value) => onUpdateShot(shot.id!, 'apex_height', value)}
          suffix=" ft"
        />
      ),
    },
    {
      accessor: 'spin_rate',
      title: 'Spin (rpm)',
      width: 100,
      render: (shot) => (
        <EditableCell
          value={shot.spin_rate}
          onSave={(value) => onUpdateShot(shot.id!, 'spin_rate', value)}
          suffix=" rpm"
        />
      ),
    },
    {
      accessor: 'side_spin_rate',
      title: 'Side Spin (rpm)',
      width: 130,
      render: (shot) => {
        const rpm = shot.side_spin_rate;
        if (rpm == null) return 'N/A';
        const dir = rpm > 0 ? 'R' : rpm < 0 ? 'L' : '';
        return (
          <EditableCell
            value={shot.side_spin_rate}
            onSave={(value) => onUpdateShot(shot.id!, 'side_spin_rate', value)}
            suffix={` rpm ${dir}`.trim()}
          />
        );
      },
    },
    {
      accessor: 'carry_distance',
      title: 'Carry (yds)',
      width: 100,
      render: (shot) => (
        <EditableCell
          value={shot.carry_distance}
          onSave={(value) => onUpdateShot(shot.id!, 'carry_distance', value)}
          suffix=" yds"
        />
      ),
    },
    {
      accessor: 'total_distance',
      title: 'Total (yds)',
      width: 100,
      render: (shot) => (
        <EditableCell
          value={shot.total_distance}
          onSave={(value) => onUpdateShot(shot.id!, 'total_distance', value)}
          suffix=" yds"
        />
      ),
    },
    {
      accessor: 'lateral_deviation',
      title: 'Offline (yds)',
      width: 110,
      render: (shot) => {
        const yds = shot.lateral_deviation;
        if (yds == null) return 'N/A';
        const dir = yds > 0 ? 'R' : yds < 0 ? 'L' : '';
        return (
          <EditableCell
            value={shot.lateral_deviation}
            onSave={(value) => onUpdateShot(shot.id!, 'lateral_deviation', value)}
            suffix={` yds ${dir}`.trim()}
          />
        );
      },
    },
    {
      accessor: 'attack_angle',
      title: 'Attack (°)',
      width: 100,
      render: (shot) => (
        <EditableCell
          value={shot.attack_angle}
          onSave={(value) => onUpdateShot(shot.id!, 'attack_angle', value)}
          suffix="°"
        />
      ),
    },
    {
      accessor: 'club_path',
      title: 'Club Path (°)',
      width: 110,
      render: (shot) => {
        const deg = shot.club_path;
        if (deg == null) return 'N/A';
        const dir = deg > 0 ? 'R' : deg < 0 ? 'L' : '';
        return (
          <EditableCell
            value={shot.club_path}
            onSave={(value) => onUpdateShot(shot.id!, 'club_path', value)}
            suffix={` ${dir}`.trim()}
          />
        );
      },
    },
    {
      accessor: 'face_angle',
      title: 'Face Angle (°)',
      width: 110,
      render: (shot) => {
        const deg = shot.face_angle;
        if (deg == null) return 'N/A';
        const dir = deg > 0 ? 'R' : deg < 0 ? 'L' : '';
        return (
          <EditableCell
            value={shot.face_angle}
            onSave={(value) => onUpdateShot(shot.id!, 'face_angle', value)}
            suffix={` ${dir}`.trim()}
          />
        );
      },
    },
    {
      accessor: 'actions',
      title: 'Actions',
      width: 80,
      render: (shot) => (
        <ActionIcon
          color="red"
          onClick={() => {
            setShotToDelete(shot.id!);
            setDeleteConfirmOpen(true);
          }}
          size="sm"
        >
          <IconTrash size={16} />
        </ActionIcon>
      ),
    },
  ];

  return (
    <>
      <DataTable
        columns={columns}
        records={shots}
        striped
        highlightOnHover
        withTableBorder
        withColumnBorders
        minHeight={300}
        noRecordsText="No shots found"
      />

      {/* Delete Confirmation Modal */}
      <Modal
        opened={deleteConfirmOpen}
        onClose={() => {
          setDeleteConfirmOpen(false);
          setShotToDelete(null);
        }}
        title="Delete Shot"
        centered
      >
        <Stack gap="md">
          <Text>Are you sure you want to delete this shot? This action cannot be undone.</Text>
          <Group justify="flex-end" gap="sm">
            <Button
              variant="outline"
              onClick={() => {
                setDeleteConfirmOpen(false);
                setShotToDelete(null);
              }}
            >
              Cancel
            </Button>
            <Button color="red" onClick={handleDeleteConfirm}>
              Delete Shot
            </Button>
          </Group>
        </Stack>
      </Modal>
    </>
  );
}