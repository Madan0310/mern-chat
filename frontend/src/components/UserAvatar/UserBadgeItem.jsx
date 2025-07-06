import { Box, Text } from "@chakra-ui/react";
import React from "react";
import { SmallCloseIcon } from "@chakra-ui/icons";

const UserBadgeItem = ({ user, handleRemoveUser }) => {
  return (
    <Box
      display={"flex"}
      alignItems={"center"}
      px={2}
      py={1}
      backgroundColor={"purple"}
      color={"white"}
      borderRadius={"lg"}
      gap={"5px"}
      cursor={"pointer"}
      onClick={handleRemoveUser}
    >
      <Text>{user.name}</Text>
      <SmallCloseIcon />
    </Box>
  );
};

export default UserBadgeItem;
